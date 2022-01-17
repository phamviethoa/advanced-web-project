import { AssignemtDto } from 'types/assignment.dto';
import Link from 'next/link';
import Input, { InputType, InputCategory } from 'components/Form/Input';
import { ClassroomDto } from 'types/classroom.dto';
import { StudentDto } from 'types/student.dto';
import { Table, Popover, Space } from 'antd';
import 'antd/dist/antd.css';
import { Row, Col, Button, Modal } from 'antd';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import * as yup from 'yup';
import { useForm, FormProvider } from 'react-hook-form';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import studentService from 'api/student';
import { toast } from 'react-toastify';

type Props = {
  classroom: ClassroomDto;
  student: StudentDto;
};

type RequestReviewFormData = {
  expectation: number;
  explanation: string;
};

const requestReviewSchema = yup.object().shape({
  expectation: yup.number().required('Expectation is required.'),
  explanation: yup.string().required('Explanation is required.'),
});

const flatten = (studentId: string, assignments: AssignemtDto[]) => {
  const filteredAssignments = assignments.map((assignment) => ({
    id: assignment.id,
    name: assignment.name,
    maxPoint: assignment.maxPoint,
    grades: assignment.grades.filter(
      (grade) =>
        (grade as unknown as { student: StudentDto }).student.id === studentId
    ),
    isFinalized: assignment.isFinalized,
  }));

  return filteredAssignments.map((assignment) => {
    const reviewId =
      assignment.grades[0].review !== null
        ? assignment.grades[0].review.id
        : null;

    if (assignment.grades[0]) {
      return {
        id: assignment.grades[0].id as string,
        point: assignment.grades[0].point,
        reviewId,
      };
    }

    return {
      id: null,
      point: null,
      reviewId: null,
    };
  });
};

type DataTable = {
  gradeId: string;
  name: string;
  point: number | null;
  maxPoint: number;
  isFinalized?: boolean;
  reviewId: string | null;
}[];

const ClassroomStudentGrade = ({ classroom, student }: Props) => {
  const requestReviewMethods = useForm<RequestReviewFormData>({
    mode: 'all',
    resolver: yupResolver(requestReviewSchema),
  });

  const { handleSubmit, reset } = requestReviewMethods;

  const [isOpenRequestReviewModal, setIsOpenRequestReviewModal] =
    useState<boolean>(false);
  const openRequestReviewModal = () => setIsOpenRequestReviewModal(true);
  const closeRequestReviewModal = () => setIsOpenRequestReviewModal(false);
  const assignments: AssignemtDto[] = classroom.assignments;

  let data: DataTable = assignments.map((assignment, index) => {
    const grades = flatten(student.id as string, assignments);

    return {
      gradeId: grades[index]?.id as string,
      name: assignment.name,
      point: grades[index]?.point,
      maxPoint: assignment.maxPoint,
      isFinalized: assignment.isFinalized,
      reviewId: grades[index].reviewId,
    };
  });

  const [gradeId, setGradeId] = useState<string | undefined>();

  const overall = {
    gradeId: '',
    name: 'Overall',
    point: data.reduce((sum, current) => {
      if (current.point && current.isFinalized) {
        return sum + current.point;
      }

      return sum;
    }, 0),
    maxPoint: data.reduce(
      (sum, current) => (current.isFinalized ? sum + current.maxPoint : sum),
      0
    ),
    reviewId: null,
  };

  data.push(overall);

  const gradeCompositions = (
    <div>
      {assignments.map((assignment, index) => (
        <Row key={index}>
          <Col span={12}>{assignment.name}</Col>
          <Col span={12}>{assignment.maxPoint}</Col>
        </Row>
      ))}
    </div>
  );

  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation(studentService.requestGradeReview, {
    onSuccess: () => {
      queryClient.invalidateQueries(['class', classroom.id]);
      toast.success('Request grade review successfully.');
    },
    onError: () => {
      toast.error('Request grade review unsuccessfully.');
    },
  });

  const requestReview = (gradeId?: string) =>
    handleSubmit(
      async ({ expectation, explanation }: RequestReviewFormData) => {
        closeRequestReviewModal();
        mutateAsync({ gradeId, expectation, explanation });
        reset();
      }
    );

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Point',
      dataIndex: 'point',
      key: 'point',
      render: (point: number, record: any) => {
        const isTotalRow = record.name === 'Overall';
        const isFinalized = record.isFinalized;

        return (
          <span>{`${!isTotalRow && !isFinalized ? '_' : point} / ${
            record.maxPoint
          }`}</span>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: any) => {
        if (record.reviewId !== null) {
          return (
            <Space size="middle">
              <Button type="primary">
                <Link href={`/class/${classroom.id}/review/${record.reviewId}`}>
                  <a>View Review</a>
                </Link>
              </Button>
            </Space>
          );
        }

        if (record.name !== 'Overall' && record.isFinalized === true) {
          return (
            <Space size="middle">
              <Button
                type="primary"
                onClick={() => {
                  setGradeId(record.gradeId);
                  openRequestReviewModal();
                }}
              >
                Request Review
              </Button>
            </Space>
          );
        }
      },
    },
  ];

  return (
    <div>
      <Modal
        title="Request Review"
        visible={isOpenRequestReviewModal}
        onCancel={closeRequestReviewModal}
        footer={[
          <Button key="back" onClick={closeRequestReviewModal}>
            Close
          </Button>,
          <Button key="submit" type="primary" onClick={requestReview(gradeId)}>
            Send Request
          </Button>,
        ]}
      >
        <div style={{ width: '400px' }}>
          <FormProvider {...requestReviewMethods}>
            <form onSubmit={requestReview(gradeId)} noValidate>
              <Input
                type={InputType.TEXT}
                category={InputCategory.INPUT}
                name={'expectation'}
                label={'Expectation'}
              />
              <Input
                category={InputCategory.TEXTAREA}
                name={'explanation'}
                label={'Explanation'}
              />
            </form>
          </FormProvider>
        </div>
      </Modal>
      <div className="d-flex justify-content-between">
        <div className="d-flex align-items-center">
          <h2 className="text-primary me-4">Grade</h2>
          <Popover
            placement="rightBottom"
            content={gradeCompositions}
            title="Grade Compositions"
          >
            <i className="fas fa-info-circle text-muted"></i>
          </Popover>
        </div>
      </div>
      <div>
        <Table columns={columns} dataSource={data} />
      </div>
    </div>
  );
};

export default ClassroomStudentGrade;
