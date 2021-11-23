import axios from 'axios';
import { InferGetStaticPropsType } from 'next';
import { useRouter } from 'next/dist/client/router';
import * as React from 'react';
import Layout from '../../components/Layout/index'


export interface DetailClassPageProps {
}

type Post = {
  id: string
  subject: string
  description: string
}

export async function getStaticPaths() {
  const res = await axios.get('http://localhost:5000/classes');
  const classes: Post[] = await res.data;
  
  const paths=classes.map(classitem => {
  const idclass=classitem.id;
    return {
      params:{id:idclass.toString()}
    }
  })
  return {
    paths,
    fallback: false
  }
}

export async function getStaticProps(context: { params: { id: string; }; }) {
  const id = context.params.id;
  const res=  await axios.get('http://localhost:5000/classes/' + id);
  const data = await res.data;

  return {
    props:{classitem:data}
  }
}


function DetailClassPage({ classitem }: InferGetStaticPropsType<typeof getStaticProps>) {
  const classitemrender:Post=classitem;
  return (
    <div>
      <Layout>
      <h1>Detail Classroom</h1>
      <div className="d-flex justify-content-center">
        <div className="fs-2">Tên môn học: {classitemrender.subject}</div>
      </div>
      <div className="d-flex justify-content-center">
        <div className="fs-4">Mô tả môn học: {classitemrender.description}</div>
      </div>
      <div className="d-flex justify-content-between">
        <h3>Bài đăng</h3>
        <button type="button" className="btn btn-success">Thêm bài đăng</button>
      </div>
      
      <div className="d-flex justify-content-center">
        <div className="fs-4">Chưa có bài đăng</div>
      </div>
      <h3>Danh sách lớp</h3>
      <h4>Danh sách giáo viên</h4>
      <table className="table">
        <thead>
        <tr>
          <th scope="col">STT</th>
          <th scope="col">Họ và tên</th>
          <th scope="col">Mã số</th>
          <th scope="col">Email</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">1</th>
          <td>Mark</td>
          <td>Otto</td>
          <td>@mdo</td>
        </tr>
      </tbody>
      </table>
      <h4>Danh sách sinh viên</h4>
      <table className="table">
        <thead>
        <tr>
          <th scope="col">STT</th>
          <th scope="col">Họ và tên</th>
          <th scope="col">Mã số</th>
          <th scope="col">Email</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">1</th>
          <td>Mark</td>
          <td>Otto</td>
          <td>@mdo</td>
        </tr>
      </tbody>
      </table>
      </Layout>
    </div>
  );
}

export default DetailClassPage


