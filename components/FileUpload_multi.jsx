import React, { useState } from "react"
import axios from "axios"
import languageEncoding from "detect-file-encoding-and-language"
import { BACKEND_URL, SAMPLE_DATA } from "../utils/constants"

import mp4Box from "mp4box"
import { nanoid } from "nanoid"

function FileUpload() {
  const [uploadId, setUploadId] = useState({})
  const [isFileSelected, setIsFileSelected] = useState(false)
  const [metaDetails, setMetaDetails] = useState({})

  const [audioMetaDetails, setAudioMetaDetails] = useState({})
  const [videoMetaDetails, setVideoMetaDetail] = useState({})

  const [uploadStatus, setUploadStatus] = useState({
    partsUploaded: 0,
    totalParts: 0,
    chunkSize: 6,
  })

  const [isUploading, setIsUploading] = useState({
    isUploading: false,
    hasCompleted: false,
  })

  function clearFileInput(e) {
    document.getElementById("videoFile").value = null
  }

  const fileInputChangeHandler = async (e) => {
    if (isUploading.hasCompleted) {
      setIsUploading({
        hasCompleted: false,
        isUploading: false,
      })
    }

    if (uploadStatus.totalParts > 0) {
      setUploadStatus((prev) => {
        return {
          ...prev,
          partsUploaded: 0,
          totalParts: 0,
        }
      })
    }

    let videoData = document.getElementById("videoFile")
    if (videoData.files.length) {
      setIsFileSelected(true)
    } else {
      setIsFileSelected(false)
    }

    let fileData = e.target.files[0]
    const MILLION = 1024 * 1024

    if (fileData) {
      const mp4BoxFile = mp4Box.createFile()

      mp4BoxFile.onReady = function (info) {
        mp4BoxFile.flush()

        const videoInfo = info
        const { mime } = videoInfo
        const mimeData = mime.split(";").map((el) => el.trim())
        const video_format = mimeData[0]
        const codecs = mimeData[1].split("=")[1]
        const profiles = mimeData[2].split("=")[1]
        const { duration } = videoInfo
        const { size, name } = fileData

        setAudioMetaDetails(videoInfo.audioTracks)
        setVideoMetaDetail(videoInfo.videoTracks)
        setMetaDetails({
          name,
          video_format,
          codecs,
          profiles,
          size: `${(size / MILLION).toFixed(2)} MB`,
          duration: `${(duration / (60 * 1000)).toFixed(0)} Seconds`,
        })
      }

      const chunk_size = uploadStatus.chunkSize
      const totalChunks = Math.ceil(fileData.size / (chunk_size * MILLION))

      for (let i = 0; i < totalChunks; i++) {
        const startsAt = i * MILLION * chunk_size
        const endsAt =
          totalChunks - i <= 1 ? fileData.size : (i + 1) * MILLION * chunk_size

        fileData
          .slice(startsAt, endsAt)
          .arrayBuffer()
          .then((slicedBuffer) => {
            // console.log("CHUNK LENGTH LAST: ", slicedBuffer.byteLength)
            slicedBuffer.fileStart = i * chunk_size * MILLION
            mp4BoxFile.appendBuffer(slicedBuffer)
          })
      }
    }
  }

  const uploadData = async () => {
    let videoData = document.getElementById("videoFile")
    const file = videoData.files[0]
    const fileName = file.name
    const fileSize = file.size
    const fileType = file.type.split("/")[1]
    const url = `${BACKEND_URL}/aws`
    const MILLION = 1024 * 1024

    try {
      const uniqueFileName = `${fileName}__${nanoid(24)}.${fileType}`

      // get unique uploadId
      let res = await axios.post(`${url}/getUploadId`, {
        fileName: uniqueFileName,
      })

      const uploadTempId = res.data.uploadId
      // setUploadId(uploadTempId.UploadId)
      const chunkSize = uploadStatus.chunkSize * MILLION
      const chunkCount = Math.floor(fileSize / chunkSize) + 1

      setIsUploading({
        hasCompleted: false,
        isUploading: true,
      })

      setUploadStatus((prev) => {
        return {
          ...prev,
          partsUploaded: 0,
          totalParts: chunkCount,
        }
      })

      let multiUploadArray = []

      let getSignedUrlRes = await axios.post(`${url}/getUploadPart`, {
        fileName: uniqueFileName,
        partNumber: chunkCount,
        uploadId: uploadTempId.UploadId,
        fileType,
      })

      const allPartUploadPromises = []

      for (let uploadCount = 1; uploadCount < chunkCount + 1; uploadCount++) {
        let start = (uploadCount - 1) * chunkSize
        let end = uploadCount * chunkSize
        let fileBlob =
          uploadCount < chunkCount ? file.slice(start, end) : file.slice(start)

        let preSignedUrl = getSignedUrlRes.data.parts[uploadCount - 1].signedUrl

        allPartUploadPromises.push(
          axios.put(preSignedUrl, fileBlob, {}).then((response) => {
            console.log("uploaded : ", uploadCount)
            let EtagHeader = response.headers["etag"]

            let uploadPartDetails = {
              ETag: EtagHeader,
              PartNumber: uploadCount,
            }
            multiUploadArray.push(uploadPartDetails)
            setUploadStatus((prev) => {
              return {
                ...prev,
                partsUploaded: prev.partsUploaded + 1,
              }
            })
            return
          })
        )
      }

      await Promise.all(allPartUploadPromises)
      console.log("all promises resolved")

      await axios
        .post(`${url}/completeUpload`, {
          fileName: fileName,
          parts: multiUploadArray,
          uploadId: uploadId,
        })
        .then(() => {
          setIsUploading((prev) => {
            return {
              hasCompleted: true,
              isUploading: false,
            }
          })
        })
    } catch (error) {
      console.log(error)
    }
  }

  const cancelUpload = () => {
    const multipart_fileInput = document.getElementById("videoFile")
    const file = multipart_fileInput.files[0]
    const fileName = file.name
    const url = `${BACKEND_URL}/aws`
    console.log({ fileName: fileName, uploadId: uploadId })
    axios
      .post(`${url}/abortUpload`, {
        fileName,
        uploadId,
      })
      .then((res) => console.log(res))
      .catch((err) => {
        console.log(err)
      })
    clearInterval()
  }

  return (
    <section className="tw-w-full">
      <nav className=" tw-bg-green-500 tw-w-full tw-text-left tw-text-white tw-font-semibold tw-text-xl tw-px-3 tw-py-5 tw-mb-8">
        Final Chance Films
      </nav>

      <div className="tw-grid tw-place-content-center tw-h-full tw-w-full">
        <div className="tw-bg-gray-100 tw-p-5 tw-rounded tw-backdrop-blur tw-max-w-[99%]">
          <h1 className="tw-text-green-500 tw-font-semibold tw-text-lg tw-mb-6">
            {Object.keys(metaDetails).length
              ? metaDetails["name"] ?? ""
              : "Pls Select the video file"}
          </h1>

          {(isUploading.isUploading || isUploading.hasCompleted) && (
            <div className="tw-mb-8">
              <span className="tw-my-5 tw-text-blue-500 tw-font-medium tw-px-5 tw-bg-white tw-py-2 tw-rounded">
                {isUploading.hasCompleted
                  ? "Completed"
                  : `${(
                      (uploadStatus.partsUploaded / uploadStatus.totalParts) *
                      100
                    ).toFixed(0)} % ||  ${
                      uploadStatus.partsUploaded * uploadStatus.chunkSize
                    } MB uploaded`}
              </span>
            </div>
          )}

          <div className="tw-text-center tw-mb-10 tw-overflow-x-hidden tw-max-w-[85%]">
            <input
              type="file"
              id="videoFile"
              className="tw-mx-auto"
              onChange={(e) => fileInputChangeHandler(e)}
              accept="video/*"
            />
          </div>

          <div className="tw-flex tw-items-center tw-justify-between tw-mb-10">
            <button
              disabled={!isFileSelected}
              onClick={uploadData}
              className=" tw-bg-green-600 tw-rounded tw-text-white tw-px-4 tw-py-2"
            >
              Upload
            </button>
            <button
              onClick={clearFileInput}
              className=" tw-bg-red-600 tw-rounded tw-text-white tw-px-4 tw-py-2"
            >
              Clear
            </button>
          </div>

          {Object.keys(metaDetails).length > 0 && (
            <div className="tw-mb-10">
              <p className="tw-mb-2 tw-font-semibold tw-pl-1">
                Selected File Details 👇
              </p>
              <div className="tw-bg-white tw-py-6 tw-px-4 tw-rounded">
                {Object.keys(metaDetails).map((key, index) => {
                  return (
                    <p key={index} className="tw-text-gray-700 tw-mb-2">
                      <span className="tw-font-semibold tw-capitalize tw-pr-3">
                        {key}
                      </span>
                      : {metaDetails[key]}
                    </p>
                  )
                })}
              </div>
            </div>
          )}

          {videoMetaDetails.length > 0 && (
            <div className="tw-mb-10">
              <p className="tw-mb-2 tw-font-semibold tw-pl-1">
                Video Track(s) Details 👇
              </p>
              <div className="tw-bg-white tw-py-6 tw-px-4 tw-rounded">
                {videoMetaDetails.map((details, index) => {
                  return (
                    <div className="" key={index}>
                      <p className="tw-mb-3 tw-font-semibold tw-text-lg tw-text-gray-700 tw-underline">
                        Video track #{index + 1}
                      </p>
                      <div>
                        <p className="tw-text-gray-700 tw-mb-2">
                          <span className="tw-font-semibold tw-capitalize tw-pr-3">
                            duration
                          </span>
                          :{" "}
                          {`${(details.movie_duration / (60 * 1000)).toFixed(
                            0
                          )} Seconds`}
                        </p>
                        <p className="tw-text-gray-700 tw-mb-2">
                          <span className="tw-font-semibold tw-capitalize tw-pr-3">
                            layer
                          </span>
                          : {details.layer}
                        </p>
                        <p className="tw-text-gray-700 tw-mb-2">
                          <span className="tw-font-semibold tw-capitalize tw-pr-3">
                            volume
                          </span>
                          : {details.volume}
                        </p>
                        <p className="tw-text-gray-700 tw-mb-2">
                          <span className="tw-font-semibold tw-capitalize tw-pr-3">
                            track_width
                          </span>
                          : {details.track_width}
                        </p>
                        <p className="tw-text-gray-700 tw-mb-2">
                          <span className="tw-font-semibold tw-capitalize tw-pr-3">
                            track_height
                          </span>
                          : {details.track_height}
                        </p>
                        <p className="tw-text-gray-700 tw-mb-2">
                          <span className="tw-font-semibold tw-capitalize tw-pr-3">
                            codec
                          </span>
                          : {details.codec}
                        </p>
                        <p className="tw-text-gray-700 tw-mb-2">
                          <span className="tw-font-semibold tw-capitalize tw-pr-3">
                            bitrate
                          </span>
                          : {details.bitrate}
                        </p>
                        <p className="tw-text-gray-700 tw-mb-2">
                          <span className="tw-font-semibold tw-capitalize tw-pr-3">
                            resolution
                          </span>
                          : {`${details.video.width} x ${details.video.height}`}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {audioMetaDetails.length > 0 && (
            <div className="tw-mb-10">
              <p className="tw-mb-2 tw-font-semibold tw-pl-1">
                Audio Track(s) Details 👇
              </p>
              <div className="tw-bg-white tw-py-6 tw-px-4 tw-rounded">
                {audioMetaDetails.map((details, index) => {
                  return (
                    <div className="" key={index}>
                      <p className="tw-mb-3 tw-font-semibold tw-text-lg tw-text-gray-700 tw-underline">
                        Audio track #{index + 1}
                      </p>
                      <div>
                        <p className="tw-text-gray-700 tw-mb-2">
                          <span className="tw-font-semibold tw-capitalize tw-pr-3">
                            duration
                          </span>
                          :{" "}
                          {`${(details.movie_duration / (60 * 1000)).toFixed(
                            0
                          )} Seconds`}
                        </p>
                        <p className="tw-text-gray-700 tw-mb-2">
                          <span className="tw-font-semibold tw-capitalize tw-pr-3">
                            layer
                          </span>
                          : {details.layer}
                        </p>
                        <p className="tw-text-gray-700 tw-mb-2">
                          <span className="tw-font-semibold tw-capitalize tw-pr-3">
                            volume
                          </span>
                          : {details.volume}
                        </p>
                        <p className="tw-text-gray-700 tw-mb-2">
                          <span className="tw-font-semibold tw-capitalize tw-pr-3">
                            codec
                          </span>
                          : {details.codec}
                        </p>
                        <p className="tw-text-gray-700 tw-mb-2">
                          <span className="tw-font-semibold tw-capitalize tw-pr-3">
                            bitrate
                          </span>
                          : {details.bitrate}
                        </p>
                        <p className="tw-text-gray-700 tw-mb-2">
                          <span className="tw-font-semibold tw-capitalize tw-pr-3">
                            sample rate
                          </span>
                          : {details.audio.sample_rate}
                        </p>
                        <p className="tw-text-gray-700 tw-mb-2">
                          <span className="tw-font-semibold tw-capitalize tw-pr-3">
                            channel count
                          </span>
                          : {details.audio.channel_count}
                        </p>
                        <p className="tw-text-gray-700 tw-mb-2">
                          <span className="tw-font-semibold tw-capitalize tw-pr-3">
                            sample size
                          </span>
                          : {details.audio.sample_size}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default FileUpload
