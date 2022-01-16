import userService from 'api/user';
import AdminLayout from 'components/AdminLayout';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { UserDto } from 'types/user.dto';
import { Typography, Descriptions } from 'antd';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
const { Title } = Typography;

const UserInfo = () => {
  const router = useRouter();
  const id = router.query.id;

  const { data: user } = useQuery<UserDto>(['user', id], () =>
    userService.getUser(id as string)
  );

  return (
    <AdminLayout>
      <div>
        <Title level={2}>User Info</Title>
        <Descriptions>
          <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
          <Descriptions.Item label="Full Name">
            {user?.fullName}
          </Descriptions.Item>
          <Descriptions.Item label="Is Admin">
            {user?.isAdmin ? (
              <CheckCircleTwoTone twoToneColor="#52c41a" />
            ) : (
              <CloseCircleTwoTone twoToneColor="#eb2f96" />
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Is Banned">
            {user?.isBanned ? (
              <CheckCircleTwoTone twoToneColor="#52c41a" />
            ) : (
              <CloseCircleTwoTone twoToneColor="#eb2f96" />
            )}
          </Descriptions.Item>
        </Descriptions>
      </div>
    </AdminLayout>
  );
};

export default UserInfo;
