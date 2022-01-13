import reviewService from 'api/review';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import Layout from 'components/Layout';
import {
  Typography,
  Descriptions,
  Space,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Input,
} from 'antd';
import { ReviewStatus } from 'types/grade.dto';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { CheckCircleTwoTone } from '@ant-design/icons';
const { Title, Text } = Typography;

type GradeReview = {
  id: string;
  status: ReviewStatus;
  expectation: number;
  explanation: string;
  grade: {
    assignment: {
      name: string;
    };
    point: number;
    student: {
      fullName: string;
      identity: string;
    };
  };
};

const ReviewDetail = () => {
  const router = useRouter();
  const classroomId = router.query.id as string;
  const reviewId = router.query.reviewId as string;

  const [isOpenCloseReviewModal, setIsOpenCloseReviewModal] =
    useState<boolean>(false);
  const openCloseReviewModal = () => setIsOpenCloseReviewModal(true);
  const closeCloseReviewModal = () => setIsOpenCloseReviewModal(false);

  const { data: review } = useQuery(['review', reviewId], () =>
    reviewService.getReview({ reviewId, classroomId })
  );

  const data = review as unknown as GradeReview;

  const queryClient = useQueryClient();

  const { mutateAsync: closeReviewMutate } = useMutation(
    reviewService.closeReview,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['review', reviewId]);
        toast.success('Close review successfully.');
      },
      onError: () => {
        toast.error('Close review unsuccessfylly.');
      },
    }
  );

  const [form] = Form.useForm();

  const closeReview = ({ grade }: any) => {
    closeCloseReviewModal();
    form.resetFields();
    closeReviewMutate({ grade: +grade, classroomId, reviewId });
  };

  return (
    <Layout>
      <Modal
        title="Close Review"
        visible={isOpenCloseReviewModal}
        onCancel={closeCloseReviewModal}
        footer={[
          <Button key="back" onClick={closeCloseReviewModal}>
            Close
          </Button>,
          <Button key="submit" onClick={form.submit} type="primary">
            Close Review
          </Button>,
        ]}
      >
        <div>
          <Form
            name="basic"
            form={form}
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={closeReview}
            autoComplete="off"
          >
            <Form.Item
              label="Final Grade"
              name="grade"
              rules={[
                {
                  required: true,
                  message: 'Final grade is required.',
                },
                {
                  pattern: new RegExp(/^[0-9]+$/),
                  message: 'Fial grade is number.',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Form>
        </div>
      </Modal>
      <div>
        <Space direction="vertical" size="large">
          <Row justify="space-between">
            <Col>
              <Title level={2}>Grade Review</Title>
            </Col>
            <Col>
              {data?.status === ReviewStatus.ACTIVE && (
                <Button onClick={openCloseReviewModal} type="primary">
                  Close Review
                </Button>
              )}
              {data?.status === ReviewStatus.RESOLVED && (
                <Space>
                  <Text type="success" strong={true}>
                    Resolved
                  </Text>
                  <CheckCircleTwoTone twoToneColor="#52c41a" />
                </Space>
              )}
            </Col>
          </Row>
          <div>
            <Space direction="vertical" size="middle">
              <Descriptions title="Student Info">
                <Descriptions.Item label="Identity">
                  {data?.grade.student.identity}
                </Descriptions.Item>
                <Descriptions.Item label="Full Name">
                  {data?.grade.student.fullName}
                </Descriptions.Item>
              </Descriptions>
              <Descriptions title="Review Info">
                <Descriptions.Item label="Grade Composition">
                  {data?.grade.assignment.name}
                </Descriptions.Item>
                <Descriptions.Item label="Current Grade">
                  {data?.grade.point}
                </Descriptions.Item>
                <Descriptions.Item label="Expected Grade">
                  {data?.expectation}
                </Descriptions.Item>
                <Descriptions.Item label="Explanation">
                  {data?.explanation}
                </Descriptions.Item>
              </Descriptions>
            </Space>
          </div>
        </Space>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const classroomId = params?.id as string;
  const reviewId = params?.reviewId as string;
  const queryClient = new QueryClient();

  Promise.all([
    queryClient.prefetchQuery(['review', reviewId], () =>
      reviewService.getReview({ reviewId, classroomId })
    ),
  ]);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default ReviewDetail;
