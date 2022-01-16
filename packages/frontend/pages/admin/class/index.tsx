import { Button, Row, Space, Table, Typography } from 'antd';
import classApi from 'api/class';
import AdminLayout from 'components/AdminLayout';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import { ClassroomDto } from 'types/classroom.dto';
const { Title } = Typography;

type DataTable = {
  id: string;
  subject: string;
  numberOfTeachers: number;
  numberOfStudents: number;
}[];

const ClassroomManagement = () => {
  const router = useRouter();

  const { data } = useQuery('managed-classrooms', () =>
    classApi.getManagedClassrooms()
  );

  const classrooms = data as unknown as ClassroomDto[];

  const dataTable: DataTable = classrooms?.map((classroom) => {
    return {
      id: classroom.id as string,
      subject: classroom.subject,
      numberOfTeachers: classroom.teachers.length,
      numberOfStudents: classroom.students.length,
    };
  });

  const viewClassroomDetail = (id: string) => () => {
    router.push(`/admin/class/${id}`);
  };

  const classroomColumn = [
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'identity',
    },
    {
      title: 'Number Of Teachers',
      dataIndex: 'numberOfTeachers',
      key: 'numberOfTeachers',
    },
    {
      title: 'Number Of Students',
      dataIndex: 'numberOfStudents',
      key: 'numberOfStudents',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: any) => {
        return (
          <Space size="middle">
            <Button onClick={viewClassroomDetail(record.id)} type="default">
              Detail
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <AdminLayout>
      <div>
        <Row align="middle">
          <Space>
            <Title level={2}>Classrooms Management</Title>
          </Space>
        </Row>
        <Table columns={classroomColumn} dataSource={dataTable} />
      </div>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const queryClient = new QueryClient();

  Promise.all([
    queryClient.prefetchQuery('managed-classrooms', () =>
      classApi.getManagedClassrooms()
    ),
  ]);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default ClassroomManagement;
