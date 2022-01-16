import { ExclamationOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  Row,
  Select,
  Space,
  Table,
  Typography,
  Modal,
} from 'antd';
import studentService from 'api/student';
import userService from 'api/user';
import AdminLayout from 'components/AdminLayout';
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import { toast } from 'react-toastify';
import { UserDto } from 'types/user.dto';
const { Title } = Typography;

type DataTable = {
  id: string;
  classroomId: string;
  userId: string | null;
  fullName: string;
  subject: string;
  identity: string;
  email: string | null;
}[];

type Student = {
  id: string;
  fullName: string;
  identity: string;
  classroom: {
    id: string;
    subject: string;
  };
  user?: {
    id: string;
    email: string;
  };
};

const StudentsManagement = () => {
  const { data } = useQuery('managed-students', () =>
    studentService.getStudents()
  );

  const [form] = Form.useForm();

  const [isOpenMappingAccountModal, setIsOpenMappingAccountModal] =
    useState<boolean>(false);

  const openMappingAccountModal = () => setIsOpenMappingAccountModal(true);
  const closeMappingAccountModal = () => setIsOpenMappingAccountModal(false);

  const [mappableUsers, setMappableUsers] = useState<UserDto[]>([]);
  const [studentId, setStudentId] = useState<string>('');

  const students = data as unknown as Student[];

  const dataTable: DataTable = students?.map((student) => {
    return {
      id: student.id,
      classroomId: student.classroom.id,
      userId: student.user?.id || null,
      fullName: student.fullName,
      subject: student.classroom.subject,
      identity: student.identity,
      email: student.user?.email || null,
    };
  });

  const queryClient = useQueryClient();

  const { mutateAsync: unmapStudentMutate } = useMutation(
    studentService.unMapStudent,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('managed-students');
        toast.success('Unmap student successfully.');
      },
      onError: () => {
        toast.error('Unmap student unsuccessfully.');
      },
    }
  );

  const { mutateAsync: mapStudentMutate } = useMutation(
    studentService.mapStudent,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('managed-students');
        toast.success('Mapping student successfully.');
      },
      onError: () => {
        toast.error('Mapping student unsuccessfully.');
      },
    }
  );

  const fetchMappableUsers = async (classroomId: string) => {
    try {
      const users = await userService.getMappableUser(classroomId);
      setMappableUsers(users as unknown as UserDto[]);
    } catch {
      toast.error('Map student unsuccessfully.');
    }
  };

  const unmapStudent = (studentId: string) => () => {
    unmapStudentMutate(studentId);
  };

  const mappingStudent = ({ accountId }: any) => {
    closeMappingAccountModal();
    form.resetFields();
    mapStudentMutate({ id: studentId, accountId });
  };

  const confirmUnmapStudent = (studentId: string) => () => {
    Modal.confirm({
      title: 'Unban Admin',
      icon: <ExclamationOutlined />,
      content: 'Are you sure you want to unmap this student.',
      okText: 'Yes',
      cancelText: 'No',
      onOk: unmapStudent(studentId),
    });
  };

  const adminColumns = [
    {
      title: 'Identity',
      dataIndex: 'identity',
      key: 'identity',
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: any) => {
        return (
          <Space size="middle">
            {record.email !== null ? (
              <Button onClick={confirmUnmapStudent(record.id)} type="default">
                Unmap
              </Button>
            ) : (
              <Button
                onClick={() => {
                  fetchMappableUsers(record.classroomId);
                  openMappingAccountModal();
                  setStudentId(record.id);
                }}
                type="default"
              >
                Map
              </Button>
            )}
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
            <Title level={2}>Students Management</Title>
          </Space>
        </Row>
        <Table columns={adminColumns} dataSource={dataTable} />
      </div>
      <Modal
        title="Mapping Account"
        visible={isOpenMappingAccountModal}
        onCancel={closeMappingAccountModal}
        footer={[
          <Button key="back" onClick={closeMappingAccountModal}>
            Close
          </Button>,
          <Button key="submit" onClick={form.submit} type="primary">
            Map
          </Button>,
        ]}
      >
        <div>
          <Form
            name="basic"
            form={form}
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={mappingStudent}
            autoComplete="off"
          >
            <Form.Item name="accountId" label="Account">
              <Select>
                {mappableUsers.map((user) => (
                  <Select.Option value={user.id}>{user.fullName}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const queryClient = new QueryClient();

  Promise.all([
    queryClient.prefetchQuery('managed-students', () =>
      studentService.getStudents()
    ),
  ]);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default StudentsManagement;
