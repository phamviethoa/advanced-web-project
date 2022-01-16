import AdminLayout from 'components/AdminLayout';
import { Typography, Table, Space, Button, Modal } from 'antd';
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
import { useSession } from 'next-auth/client';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

type Users = {
  email: string;
  fullName: string;
  isAdmin: boolean;
  isBanned: boolean;
}[];

const UsersManagement = () => {
  const { data } = useQuery('managed-users', () => userService.getUsers());

  const router = useRouter();

  const accounts = data as unknown as Users;

  if (accounts && accounts.length !== 0) {
    accounts[0].isAdmin = true;
    accounts[0].isBanned = true;
  }

  const users = accounts?.filter((account) => account.isAdmin === false);

  const queryClient = useQueryClient();

  const { mutateAsync: removeUserMutate } = useMutation(
    userService.removeUser,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('managed-users');
        toast.success('Delete user successfully.');
      },
      onError: () => {
        toast.error('Delete user unsuccessfully.');
      },
    }
  );

  const { mutateAsync: banUserMutate } = useMutation(userService.banUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('managed-users');
      toast.success('Ban user successfully.');
    },
    onError: () => {
      toast.error('Ban user unsuccessfully.');
    },
  });

  const { mutateAsync: unbanUserMutate } = useMutation(userService.unBanUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('managed-users');
      toast.success('Unban user successfully.');
    },
    onError: () => {
      toast.error('Unban user unsuccessfully.');
    },
  });

  const viewUserDetail = (id: string) => () => {
    router.push(`/admin/user/${id}`);
  };

  const removeUser = (id: string) => () => {
    removeUserMutate(id);
  };

  const banAdmin = (id: string) => () => {
    banUserMutate(id);
  };

  const unbanAdmin = (id: string) => () => {
    unbanUserMutate(id);
  };

  const confirmDeleteUser = (id: string) => () => {
    Modal.confirm({
      title: 'Delete User',
      icon: <ExclamationOutlined />,
      content: 'Are you sure you want to delete this user.',
      okText: 'Yes',
      cancelText: 'No',
      onOk: removeUser(id),
    });
  };

  const confirmBanUser = (id: string) => () => {
    Modal.confirm({
      title: 'Ban User',
      icon: <ExclamationOutlined />,
      content: 'Are you sure you want to ban this user.',
      okText: 'Yes',
      cancelText: 'No',
      onOk: banAdmin(id),
    });
  };

  const confirmUnbanUser = (id: string) => () => {
    Modal.confirm({
      title: 'Unban User',
      icon: <ExclamationOutlined />,
      content: 'Are you sure you want to unban this user.',
      okText: 'Yes',
      cancelText: 'No',
      onOk: unbanAdmin(id),
    });
  };

  const columns = [
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
            <Button onClick={confirmDeleteUser(record.id)} type="default">
              Delete
            </Button>
            {record.isBanned ? (
              <Button onClick={confirmUnbanUser(record.id)} type="default">
                Unban
              </Button>
            ) : (
              <Button onClick={confirmBanUser(record.id)} type="default">
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
        <Title level={2}>Users Managements</Title>
        <Table columns={columns} dataSource={users} />
      </div>
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
