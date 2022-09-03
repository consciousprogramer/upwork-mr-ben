import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import FileUpload from "../components/FileUpload_multi"

export default function Home() {
  const [selectedFile, SetSelectedFile] = useState()
  return (
    <>
      <FileUpload />
    </>
  )
}
