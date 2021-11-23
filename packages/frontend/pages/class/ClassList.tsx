import * as React from 'react';
import Link from 'next/link';
import Layout from 'components/Layout';

type Post = {
  id: string;
  subject: string;
  description: string;
};

export interface ClassListProps {
  classes: Post[];
}

export default function ClassList(props: ClassListProps) {
  const classes = props.classes;
  return (
    <div>
      <Layout>
        <div className="d-flex justify-content-around">
          <h1 className="mb-5">Danh sách các lớp học</h1>
          <div>
            <button type="button" className="btn btn-success m-2">
              <Link href={`/class/createclass`}>
                <a>Create Class</a>
              </Link>
            </button>
          </div>
        </div>
        <div className="container">
          <div className="row g-2">
            {classes.map((classitem) => (
              <div className="col-4">
                <div className="p-4 bg-white rounded shadow">
                  <div className="d-flex justify-content-center">
                    <div className="btn-lg">{classitem.subject}</div>
                  </div>
                  <div className="d-flex justify-content-center">
                    <p>{classitem.description}</p>
                  </div>
                  <div className="d-flex justify-content-center">
                    <button type="button" className="btn btn-info btn-lg">
                      <Link
                        key={classitem.id}
                        href={`/class/${encodeURIComponent(classitem.id)}`}
                      >
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
