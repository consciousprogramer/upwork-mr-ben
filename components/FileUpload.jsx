import React, { useState } from "react"
import axios from "axios"
import languageEncoding from "detect-file-encoding-and-language"
import { BACKEND_URL } from "../utils/constants"

import mp4boxfile from "mp4box"

function FileUpload() {
  const [uploadId, setUploadId] = useState({})
  const [isFileSelected, setIsFileSelected] = useState(false)
  const [metaDetails, setMetaDetails] = useState({})
  const [uploadStatus, setUploadStatus] = useState({
    partsUploaded: 0,
    totalParts: 0,
    chunkSize: 6,
  })

  const [isUploading, setIsUploading] = useState({
    isUploading: false,
    hasCompleted: false,
  })

  const fileInputChangeHandler = (e) => {
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

    if (fileData) {
      languageEncoding(fileData).then((fileInfo) => {
        setMetaDetails((prev) => {
          const tempDetails = { ...prev }
          const { confidence, encoding, language } = fileInfo
          tempDetails["encoding"] = encoding
          tempDetails["language"] = language
          console.log("encoding : ", encoding)
          return tempDetails
        })
      })
    }

    const videoEl = document.createElement("video")
    videoEl.src = window.URL.createObjectURL(fileData)

    videoEl.onloadedmetadata = (e) => {
      window.URL.revokeObjectURL(videoEl.src)
      const { name, type, size } = fileData
      const { videoWidth, videoHeight, duration } = videoEl

      setMetaDetails((prev) => {
        const tempDetails = { ...prev }
        tempDetails["name"] = name
        tempDetails["size"] = `${(size / (1024 * 1024)).toFixed(2)} MB`
        tempDetails["extension"] = type
        tempDetails["duration"] = `${duration.toFixed(0)} Seconds`
        tempDetails["videoWidth"] = videoWidth
        tempDetails["videoHeight"] = videoHeight
        tempDetails["resolution"] = `${videoWidth} x ${videoHeight}`
        return tempDetails
      })
    }
  }

  const uploadData = async () => {
    let videoData = document.getElementById("videoFile")
    const file = videoData.files[0]
    const fileName = file.name
    const fileSize = file.size
    const fileType = file.type.split("/")[1]
    const url = `${BACKEND_URL}/aws`

    try {
      let res = await axios.post(`${url}/getUploadId`, { fileName: fileName })
      const uploadTempId = res.data.uploadId
      console.log(uploadTempId)
      setUploadId(uploadTempId)
      const chunkSize = uploadStatus.chunkSize * 1024 * 1024
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

      //   multipart url
      let multiUploadArray = []

      let getSignedUrlRes = await axios.post(`${url}/getUploadPart`, {
        fileName,
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
          axios
            .put(preSignedUrl, fileBlob, {
              // onUploadProgress: (progressEvent) =>
              //   setUploadStatus((prev) => {
              //     return {
              //       ...prev,
              //     }
              //   }),
            })
            .then((response) => {
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
            })
        )
      }

      await Promise.all(allPartUploadPromises)

      await axios
        .post(`${url}/completeUpload`, {
          fileName: fileName,
          parts: multiUploadArray,
          uploadId: uploadTempId.UploadId,
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
            <button className=" tw-bg-red-600 tw-rounded tw-text-white tw-px-4 tw-py-2">
              Cancel
            </button>
          </div>

          {Object.keys(metaDetails).length > 0 && (
            <div className="">
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
        </div>
      </div>
    </section>
  )
}

export default FileUpload
