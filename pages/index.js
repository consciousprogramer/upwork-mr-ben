import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import FileUpload from "../components/FileUpload"

export default function Home() {
  const [selectedFile, SetSelectedFile] = useState()
  return (
    <>
      {/* <section className='tw-h-screen'>
        <nav className=' tw-bg-green-500 tw-w-full tw-text-leftm tw-text-white tw-font-semibold tw-text-xl tw-p-5 '>Final Chance Films</nav>
        <div className="tw-grid tw-place-content-center tw-h-full">
          <div className="tw-bg-green-500/60 tw-p-5 tw-rounded tw-backdrop-blur tw-text-center">
            <h1 className="tw-text-white tw-font-semibold tw-text-lg tw-mb-6">Pls Select the video file</h1>

          </div>
        </div>
      </section> */}
      <FileUpload />
    </>
  )
}
