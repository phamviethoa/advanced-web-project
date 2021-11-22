import  Axios  from 'axios';
import { type } from 'os';
import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link'
import Layout from '../../components/Layout/index'

type Post = {
    id: string
    subject: string
    description: string
}

export interface ClassListProps {
    classes:Post[]
}


export default function ClassList (props: ClassListProps) {
  const classes=props.classes;

  return (
    <div>
      <Layout>
      <div className="d-flex justify-content-around">
      <h1 >Danh sách các lớp học</h1>
      <div>
      <button type="button" className="btn btn-success">
          <Link  href={`/class/createclass`}>
            <a>Create Class</a>
          </Link>
      </button>
      </div>
      </div>
        <div className="container">
        <div className="row g-2">
        {classes.map((classitem)=>(
            <div className="col-6 ">
              <div className="p-3 border bg-light" key={classitem.id}>
              <div className="d-flex justify-content-center">
                <div className="btn-lg">{classitem.subject}</div>
              </div>
              <div className="d-flex justify-content-center">
                <p>{classitem.description}</p>
              </div>
                <div className="d-flex justify-content-center">
                  <button type="button" className="btn btn-info btn-lg">
                    <Link  href={`/class/${encodeURIComponent(classitem.id)}`}>
                      <a>Chi tiết lớp học</a>
                    </Link>
                  </button>
                </div>
              </div>
            </div>
        ))} 
        </div>
      </div>
      </Layout>
    </div>
  );
}
