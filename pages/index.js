import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import FileUpload from "../components/FileUpload"

export default function Home() {
  const [selectedFile, SetSelectedFile] = useState()
  return (
    <>
      <FileUpload />
    </>
  )
}
