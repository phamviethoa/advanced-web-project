import AdminLayout from 'components/AdminLayout';
import {
  Input,
  Typography,
  Table,
  Space,
  Button,
  Row,
  Modal,
  Form,
} from 'antd';
import { GetServerSideProps } from 'next';
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import userService from 'api/user';
const { Title } = Typography;
import { ExclamationOutlined, PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import useUser from 'hooks/useUser';
import { useSession } from 'next-auth/client';

type Users = {
  id: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
  isBanned: boolean;
}[];

const UsersManagement = () => {
  const { data } = useQuery('managed-users', () => userService.getUsers());

  const router = useRouter();

  const [isOpenCreateAdminModal, setIsOpenCreateAdminModal] =
    useState<boolean>(false);

  const openCreateAdminModal = () => setIsOpenCreateAdminModal(true);
  const closeCreateAdminModal = () => setIsOpenCreateAdminModal(false);

  const [form] = Form.useForm();
  const [session] = useSession();

  const userId = (session?.user as { id: string })?.id || '';

  const accounts = data as unknown as Users;

  const admins = accounts?.filter(
    (account) => account.isAdmin === true && account.id !== userId
  );

  const queryClient = useQueryClient();

  const { mutateAsync: createAdminMutate } = useMutation(userService.addAdmin, {
    onSuccess: () => {
      queryClient.invalidateQueries('managed-users');
      toast.success('Create admin successfully.');
    },
    onError: () => {
      toast.error('Create admin unsuccessfully.');
    },
  });

  const { mutateAsync: removeAdminMutate } = useMutation(
    userService.removeUser,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('managed-users');
        toast.success('Delete admin successfully.');
      },
      onError: () => {
        toast.error('Delete admin unsuccessfully.');
      },
    }
  );

  const { mutateAsync: banUserMutate } = useMutation(userService.banUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('managed-users');
      toast.success('Ban admin successfully.');
    },
    onError: () => {
      toast.error('Ban admin unsuccessfully.');
    },
  });

  const { mutateAsync: unbanUserMutate } = useMutation(userService.unBanUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('managed-users');
      toast.success('Unban admin successfully.');
    },
    onError: () => {
      toast.error('Unban admin unsuccessfully.');
    },
  });

  const addAdmin = ({ email, fullName, password }: any) => {
    form.resetFields();
    closeCreateAdminModal();
    createAdminMutate({ email, fullName, password });
  };

  const viewUserDetail = (id: string) => () => {
    router.push(`/admin/user/${id}`);
  };

  const removeAdmin = (id: string) => () => {
    removeAdminMutate(id);
  };

  const banAdmin = (id: string) => () => {
    banUserMutate(id);
  };

  const unbanAdmin = (id: string) => () => {
    unbanUserMutate(id);
  };

  const confirmDeleteAdmin = (id: string) => () => {
    Modal.confirm({
      title: 'Delete Admin',
      icon: <ExclamationOutlined />,
      content: 'Are you sure you want to delete this admin',
      okText: 'Yes',
      cancelText: 'No',
      onOk: removeAdmin(id),
    });
  };

  const confirmBanAdmin = (id: string) => () => {
    Modal.confirm({
      title: 'Ban Admin',
      icon: <ExclamationOutlined />,
      content: 'Are you sure you want to ban this admin',
      okText: 'Yes',
      cancelText: 'No',
      onOk: banAdmin(id),
    });
  };

  const confirmUnbanAdmin = (id: string) => () => {
    Modal.confirm({
      title: 'Unban Admin',
      icon: <ExclamationOutlined />,
      content: 'Are you sure you want to unban this admin',
      okText: 'Yes',
      cancelText: 'No',
      onOk: unbanAdmin(id),
    });
  };

  const adminColumns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: any) => {
        return (
          <Space size="middle">
            <Button onClick={viewUserDetail(record.id)} type="default">
              Detail
            </Button>
            <Button onClick={confirmDeleteAdmin(record.id)} type="default">
              Delete
            </Button>
            {record.isBanned ? (
              <Button onClick={confirmUnbanAdmin(record.id)} type="default">
                Unban
              </Button>
            ) : (
              <Button onClick={confirmBanAdmin(record.id)} type="default">
                Ban
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
            <Title level={2}>Admins Managements</Title>
            <PlusOutlined
              onClick={openCreateAdminModal}
              style={{ fontSize: '20px' }}
            />
          </Space>
        </Row>
        <Table columns={adminColumns} dataSource={admins} />
      </div>
      <Modal
        title="Create Admin"
        visible={isOpenCreateAdminModal}
        onCancel={closeCreateAdminModal}
        footer={[
          <Button key="back" onClick={closeCreateAdminModal}>
            Close
          </Button>,
          <Button key="submit" onClick={form.submit} type="primary">
            Create
          </Button>,
        ]}
      >
        <div>
          <Form
            name="basic"
            form={form}
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={addAdmin}
            autoComplete="off"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Email is required.',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[
                {
                  required: true,
                  message: 'Full Name is required.',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Password is required.',
                },
              ]}
            >
              <Input.Password />
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
    queryClient.prefetchQuery('managed-users', () => userService.getUsers()),
  ]);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default UsersManagement;
