import { GetServerSideProps } from 'next';
import * as React from 'react';
import Layout, { LayoutOptions } from 'components/Layout/index';
import { useState } from 'react';
import ClassroomExercise from 'components/Class/ClassroomExercise';
import ClassroomNews from 'components/Class/ClassroomNews';
import ClassroomPeople from 'components/Class/ClassroomPeople';
import ClassroomGrade from 'components/Class/ClassroomGrade';
import ClassroomStudentGrade from 'components/Class/ClassroomStudentGrade';
import { ClassroomDto } from 'types/classroom.dto';
import { StudentDto } from 'types/student.dto';
import { dehydrate, QueryCache, QueryClient, useQuery } from 'react-query';
import classApi from 'api/class';
import { useRouter } from 'next/router';
import { UserRole } from 'types/user.dto';
import useUser from 'hooks/useUser';
import Error from 'next/error';

enum ClassroomTab {
  NEWS = 'NEWS',
  PEOPLE = 'PEOPLE',
  GRADE = 'GRADE',
}

function DetailClassPage() {
  const [currentTab, setCurrentTab] = useState<ClassroomTab>(ClassroomTab.NEWS);

  const router = useRouter();
  const id = router.query.id;

  const { data } = useQuery(['class', id], () =>
    classApi.getClass(id as string)
  );

  const classroom = data as unknown as ClassroomDto;

  const user = useUser(classroom?.id as string);
  const role = user.role;
  const student = classroom?.students.find(
    (student) => student.user?.id === user.id
  );

  const navbarOptions: LayoutOptions[] = [
    {
      name: 'News',
      onClick: () => setCurrentTab(ClassroomTab.NEWS),
    },
    {
      name: 'People',
      onClick: () => setCurrentTab(ClassroomTab.PEOPLE),
    },
    {
      name: 'Grade',
      onClick: () => setCurrentTab(ClassroomTab.GRADE),
    },
  ];

  const renderTab = {
    [ClassroomTab.NEWS]: (
      <ClassroomNews classroom={classroom as ClassroomDto} />
    ),
    [ClassroomTab.PEOPLE]: (
      <ClassroomPeople
        role={role as UserRole}
        classroom={classroom as ClassroomDto}
        students={classroom?.students as StudentDto[]}
      />
    ),
    [ClassroomTab.GRADE]:
      role === UserRole.TEACHER ? (
        <ClassroomGrade classroom={classroom as ClassroomDto} />
      ) : (
        <ClassroomStudentGrade
          student={student as StudentDto}
          classroom={classroom as ClassroomDto}
        />
      ),
  };

  return (
    <div>
      <Layout options={navbarOptions}>{renderTab[currentTab]}</Layout>
    </div>
  );
}

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

export default DetailClassPage;
