import axios from 'axios';
import { InferGetStaticPropsType } from 'next';
import * as React from 'react';
import { useState } from 'react';
import Layout from '../../components/Layout/index';

export interface ProfilePageProps {}

type Post = {
  id: string;
  fullName: string;
};

export async function getStaticPaths() {
  const res = await axios.get('http://localhost:5000/users');
  const classes: Post[] = await res.data;

  const paths = classes.map((classitem) => {
    const idclass = classitem.id;
    return {
      params: { id: idclass.toString() },
    };
  });
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps(context: { params: { id: string } }) {
  const id = context.params.id;
  const res = await axios.get('http://localhost:5000/users/' + id);
  const data = await res.data;
  return {
    props: { useritem: data },
  };
}

//export default function ProfilePage (props: ProfilePageProps) {
export default function ProfilePage({
  useritem,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const classitemrender: Post = useritem;
  const url = 'http://localhost:5000/users/';

  const [data, setData] = useState({
    id: classitemrender.id,
    fullName: classitemrender.fullName,
  });

  function handle(
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) {
    const newdata = { ...data };
    if (e.target.id === 'fullName') {
      newdata[e.target.id] = e.target.value;
    }
    setData(newdata);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log(data);
    await axios.put(url + `${data.id}`, {
      id: data.id,
      fullName: data.fullName,
    });
  }
  return (
    <div>
      <Layout>
        <h1>Thông tin người dùng</h1>
        <div className="d-flex justify-content-center">
          <img
            src="http://placekitten.com/g/200/200"
            className="rounded-circle"
          />
        </div>
        <form onSubmit={(e) => submit(e)}>
          <div className="mb-3">
            <label htmlFor="formGroupExampleInput" className="form-label">
              Thông tin cá nhân
            </label>
            <div className="form-label">Họ và tên</div>
            <input
              onChange={(e) => handle(e)}
              type="text"
              className="form-control"
              id="fullName"
              placeholder={data.fullName}
            />
          </div>
          <div className="col-auto mt-3">
            <button type="submit" className="btn btn-primary">
              Lưu thông tin
            </button>
          </div>
        </form>
      </Layout>
    </div>
  );
}
