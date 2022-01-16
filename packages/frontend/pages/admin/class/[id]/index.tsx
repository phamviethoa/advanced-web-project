import { Descriptions, Typography, Divider, Row, Space } from 'antd';
const { Title } = Typography;
import classApi from 'api/class';
import AdminLayout from 'components/AdminLayout';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient, useQuery } from 'react-query';

const ManagedClassroomDetail = () => {
  const router = useRouter();
  const id = router.query.id as string;

  const { data: classroom } = useQuery(['class', id], () =>
    classApi.getClass(id)
  );

  return (
    <AdminLayout>
      <Space direction="vertical" size="large">
        <Space direction="vertical" size="large">
          <Title level={2}>Classroom Info</Title>
          <Descriptions>
            <Descriptions.Item label="Subject">
              {classroom?.subject}
            </Descriptions.Item>
            <Descriptions.Item label="Code">
              {classroom?.code}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {classroom?.description}
            </Descriptions.Item>
          </Descriptions>
        </Space>
        <div>
          <Divider orientation="left">Teachers</Divider>
          {classroom?.teachers?.map((teacher) => (
            <div key={teacher.id} className="my-3 d-flex align-items-center">
              <div
                style={{ width: '30px', height: '30px' }}
                className="bg-primary rounded-circle"
              ></div>
              <h2 className="h6 m-0 p-0 ms-3">{teacher.fullName}</h2>
            </div>
          ))}
        </div>
        <div>
          <Divider orientation="left">Students</Divider>
          {classroom?.students.map((student) => (
            <div key={student.id} className="my-3 d-flex align-items-center">
              <div
                style={{ width: '30px', height: '30px' }}
                className="bg-primary rounded-circle"
              ></div>
              <h2 className="h6 m-0 p-0 ms-3">{student.fullName}</h2>
            </div>
          ))}
        </div>
      </Space>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery(['class', id], () => classApi.getClass(id)),
  ]);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default ManagedClassroomDetail;
