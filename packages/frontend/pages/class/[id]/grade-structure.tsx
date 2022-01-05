import Layout from 'components/Layout';
import { Table, Column, HeaderCell, Cell } from 'rsuite-table';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import classApi from 'api/class';
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { ClassroomDto } from 'types/classroom.dto';
import { AssignemtDto, UpdateAssignmentDto } from 'types/assignment.dto';
import assignmentApi from 'api/assignment';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

type UpdateAssignment = {
  name: string;
  maxPoint: number;
};

type FormFields = {
  assignments: UpdateAssignment[];
};

const assignmentsSchema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required.')
    .max(150, 'Name is max 100 characters.'),
  maxPoint: yup
    .number()
    .typeError('Point must be a number')
    .required('Point is required.'),
});

const schema = yup.object().shape({
  assignments: yup.array().of(assignmentsSchema),
});

const GradeStructure = () => {
  const router = useRouter();
  const id = router.query.id as string;

  const [isViewMode, setIsViewMode] = useState<boolean>(true);

  const toggleViewMode = () => setIsViewMode(true);
  const toggleEditMode = () => setIsViewMode(false);

  const { data: classroom } = useQuery<ClassroomDto>(['class', id], () =>
    classApi.getClass(id)
  );

  const assignments = classroom?.assignments as AssignemtDto[];

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormFields>({
    mode: 'all',
    resolver: yupResolver(schema),
    defaultValues: {
      assignments,
    },
  });

  const { fields, append, remove } = useFieldArray<FormFields>({
    control,
    name: 'assignments',
  });

  const queryClient = useQueryClient();

  const { mutateAsync: mutateAssignments } = useMutation(assignmentApi.update, {
    onSuccess: () => {
      queryClient.invalidateQueries(['class', id]);
      toast.success('Update assignments successfully.');
    },
    onError: () => {
      toast.error('Update assignments unsuccessfully.');
    },
  });

  const updateAssignment = handleSubmit(async ({ assignments }) => {
    const data: UpdateAssignmentDto = assignments.map((assignment) => ({
      name: assignment.name,
      maxPoint: assignment.maxPoint,
    }));

    mutateAssignments({
      classroomId: classroom?.id,
      updateAssignmentDto: data,
    });

    toggleViewMode();
  });

  const handleOnDragEnd = async (result: any) => {
    if (!result.destination) {
      return;
    }

    console.log(result);

    const assignments = watch('assignments');

    const items: UpdateAssignmentDto = Array.from(assignments);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
  };

  return (
    <Layout>
      <div>
        <div className="mb-5">
          <h2 className="text-primary">
            Assignments
            {isViewMode && (
              <i
                onClick={toggleEditMode}
                style={{ fontSize: '1rem' }}
                className="ms-3 fas fa-pen text-muted"
              ></i>
            )}
          </h2>
        </div>
        {isViewMode ? (
          <div>
            <Table
              data={assignments as AssignemtDto[]}
              autoHeight={true}
              bordered={true}
            >
              <Column width={300} align="center">
                <HeaderCell>Name</HeaderCell>
                <Cell dataKey="name" />
              </Column>
              <Column width={100} align="center">
                <HeaderCell>Scale</HeaderCell>
                <Cell dataKey="maxPoint" />
              </Column>
            </Table>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <div className="assignments col rounded shadow-sm p-5 w-50 m-auto">
              <form noValidate onSubmit={updateAssignment}>
                <Droppable droppableId="assignments">
                  {(provided) => (
                    <div
                      className="assignments"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {fields.map(({ id, name }, index) => {
                        return (
                          <Draggable
                            key={index}
                            draggableId={`${name + index}`}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                ref={provided.innerRef}
                                className="rounded p-2 my-3 border"
                                key={id}
                              >
                                <div className="row p-3">
                                  <div className="col">
                                    <input
                                      type="text"
                                      className={`form-control ${
                                        (errors.assignments || [])[index]?.name
                                          ? 'is-invalid'
                                          : ''
                                      }`}
                                      {...register(
                                        `assignments.${index}.name` as const
                                      )}
                                    />
                                    <div className="invalid-feedback">
                                      {
                                        (errors.assignments || [])[index]?.name
                                          ?.message
                                      }
                                    </div>
                                  </div>
                                  <div className="col">
                                    <input
                                      type="text"
                                      className={`form-control ${
                                        (errors.assignments || [])[index]
                                          ?.maxPoint
                                          ? 'is-invalid'
                                          : ''
                                      }`}
                                      {...register(
                                        `assignments.${index}.maxPoint` as const
                                      )}
                                    />
                                    <div className="invalid-feedback">
                                      {
                                        (errors.assignments || [])[index]
                                          ?.maxPoint?.message
                                      }
                                    </div>
                                  </div>
                                  <div className="col-1 text-right">
                                    <a onClick={() => remove(index)}>
                                      <i className="fas fa-trash icon-md text-danger"></i>
                                    </a>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      <div className="float-end border p-2 rounded">
                        <a onClick={() => append({})}>
                          <i className="fas fa-plus text-muted"></i>
                        </a>
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </form>
            </div>
          </DragDropContext>
        )}
      </div>
    </Layout>
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

export default GradeStructure;
