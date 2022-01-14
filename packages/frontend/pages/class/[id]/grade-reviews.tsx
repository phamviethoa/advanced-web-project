import Layout from 'components/Layout';
import { Typography, Space, Button, Table } from 'antd';
import { GetServerSideProps } from 'next';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import reviewService from 'api/review';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReviewStatus } from 'types/grade.dto';
const { Title } = Typography;

type Reviews = {
  reviewId: string;
  assignmentName: string;
  identity: string;
  fullName: string;
  currentGrade: number;
  expectation: number;
  status: ReviewStatus;
}[];

const GradeReviews = () => {
  const router = useRouter();
  const classroomId = router.query.id as string;
  const { data: reviews } = useQuery('reviews', () =>
    reviewService.getAll(classroomId)
  );

  const data = reviews as unknown as Reviews;

  const columns = [
    {
      title: 'Grade Composition',
      dataIndex: 'assignmentName',
      key: 'assignmentName',
    },
    {
      title: 'Identity',
      dataIndex: 'identity',
      key: 'identity',
    },
    {
      title: 'Student Name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Current Grade',
      dataIndex: 'currentGrade',
      key: 'currentGrade',
    },
    {
      title: 'Expectation Grade',
      dataIndex: 'expectation',
      key: 'expectation',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: any) => {
        return (
          <Space size="middle">
            <Button type="primary">
              <Link href={`/class/${classroomId}/review/${record.reviewId}`}>
                <a>Detail</a>
              </Link>
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <Layout>
      <div>
        <Title level={2}>Grade Reviews</Title>
      </div>
      <div>
        <Table columns={columns} dataSource={data} />
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const classroomId = params?.id as string;
  const queryClient = new QueryClient();

  Promise.all([
    queryClient.prefetchQuery('reviews', () =>
      reviewService.getAll(classroomId)
    ),
  ]);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default GradeReviews;
