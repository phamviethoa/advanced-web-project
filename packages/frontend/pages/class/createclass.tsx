import axios from 'axios';
import * as React from 'react';
import Layout from 'components/Layout/index';
export interface CreateCLassPageProps {}
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

interface FormFields {
  subject: string;
  description: string;
}

const schema = yup.object().shape({
  subject: yup
    .string()
    .required('Subject is required.')
    .max(150, 'Subject is max 150 characters.'),
  description: yup
    .string()
    .required('Description is required.')
    .max(250, 'Description is max 250 characters.'),
});

export default function CreateCLassPage(props: CreateCLassPageProps) {
  const router = useRouter();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormFields>({
    mode: 'all',
    resolver: yupResolver(schema),
  });

  const createClass = handleSubmit(
    async ({ subject, description }: FormFields) => {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_GATEWAY}/classes`,
          {
            subject,
            description,
          }
        );

        router.push('/');
        toast.success('Create class successfully.');
      } catch {
        toast.error('Create class unsucessfully.');
      }
    }
  );

  return (
    <div>
      <Layout>
        <div className="container p-0">
          <div className="d-flex justify-content-center">
          <h1>Create Classroom</h1>
          </div>
          <div className="d-flex justify-content-center">
          <form className="col-10 col-sm-5" onSubmit={createClass} noValidate>
            <div className="mb-3">
              <label htmlFor="formGroupExampleInput" className="form-label">
                Nhập tên lớp học
              </label>
              <input
                type="text"
                className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                {...register('subject')}
                placeholder="Nhập tên lớp học"
              />
              <div className="invalid-feedback">{errors.subject?.message}</div>
            </div>
            <div className="form-floating">
              <textarea
                className={`form-control ${
                  errors.description ? 'is-invalid' : ''
                }`}
                placeholder="Leave a comment here"
                {...register('description')}
              ></textarea>
              <div className="invalid-feedback">
                {errors.description?.message}
              </div>
              <label htmlFor="floatingTextarea2">Mô tả lớp học</label>
            </div>
            <div className="col-auto mt-3">
            <div className="d-flex justify-content-center">
              <button type="submit" className="btn btn-primary">
                Tạo lớp học
              </button>
              </div>
            </div>
          </form>
          </div>
        </div>
      </Layout>
    </div>
  );
}
