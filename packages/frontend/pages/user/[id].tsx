import axios from 'axios';
import { InferGetStaticPropsType } from 'next';
import * as React from 'react';
import Layout from '../../components/Layout/index';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';

export interface ProfilePageProps {}

type Post = {
  id: string;
  fullName: string;
};

interface FormFields {
  id: string;
  fullName: string;
}

const schema = yup.object().shape({
  id: yup.string(),
  fullName: yup
    .string()
    .required('Subject is required.')
    .max(150, 'Subject is max 150 characters.'),
});

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
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_API_GATEWAY}/users/${id}`
  );
  const data = await res.data;
  return {
    props: { useritem: data },
  };
}

export default function ProfilePage({
  useritem,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const classitemrender: Post = useritem;
  const router = useRouter();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormFields>({
    mode: 'all',
    resolver: yupResolver(schema),
  });

  const createClass = handleSubmit(async ({ id, fullName }: FormFields) => {
    id = classitemrender.id;
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_GATEWAY}/users/${id}`,
        {
          id,
          fullName,
        }
      );
      router.push(`/user/${id}`);
      toast.success('Update profile successfully.');
    } catch {
      toast.error('Update profile unsucessfully.');
    }
  });

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
        <form onSubmit={createClass} noValidate>
          <div className="mb-3">
            <label htmlFor="formGroupExampleInput" className="form-label">
              Thông tin cá nhân
            </label>
            <div className="form-label">Họ và tên</div>
            <input
              type="text"
              id="fullName"
              placeholder={classitemrender.fullName}
              className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
              {...register('fullName')}
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
