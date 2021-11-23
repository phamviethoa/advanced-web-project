import  Axios  from 'axios';
import Link from 'next/link';
import * as React from 'react';
import { useState } from 'react';
import Layout from '../../components/Layout/index'
export interface CreateCLassPageProps {
}

interface e {
  subject: string;
  description: string
}


export default function CreateCLassPage (props: CreateCLassPageProps) {
  const url="http://localhost:5000/classes";
  const [data,setData]=useState({
    subject:"",
    description:""
})   
  
  function handle(e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>){
    const newdata={...data};
    if(e.target.id==='subject' ||e.target.id==='description')
    {
      newdata[e.target.id]=e.target.value;
    }
    setData(newdata)
}

async function submit(e: React.FormEvent<HTMLFormElement>){
  e.preventDefault();
  await Axios.post(url,{
    subject:data.subject,
    description:data.description
  });
}

  return (
    <div>
      <Layout>
        <h1>Create Classroom</h1>
          <form onSubmit={(e)=>submit(e)}>
          <div className="mb-3">
            <label htmlFor="formGroupExampleInput" className="form-label">Nhập tên lớp học</label>
            <input onChange={(e)=>handle(e)} type="text" className="form-control" id="subject" placeholder="Nhập tên lớp học" />
          </div>
          <div className="form-floating">
            <textarea onChange={(e)=>handle(e)} className="form-control" placeholder="Leave a comment here" id="description" ></textarea>
              <label htmlFor="floatingTextarea2">Mô tả lớp học</label>
          </div>
          <div className="col-auto mt-3">
            <button type="submit" className="btn btn-primary" >
              Tạo lớp học</button>
          </div>
          </form>
      </Layout>
    </div>
  );
}
