import { useSession } from 'next-auth/client';
import { GetServerSideProps } from 'next';
import * as React from 'react';
import Layout, { LayoutOptions } from 'components/Layout/index';
import { useState, useEffect } from 'react';
import ClassroomExercise from 'components/Class/ClassroomExercise';
import ClassroomNews from 'components/Class/ClassroomNews';
import ClassroomPeople from 'components/Class/ClassroomPeople';
import ClassroomGrade from 'components/Class/ClassroomGrade';
import ClassroomStudentGrade from 'components/Class/ClassroomStudentGrade';
import { ClassroomDto } from 'types/classroom.dto';
import { StudentDto } from 'types/student.dto';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import classApi from 'api/class';
import { useRouter } from 'next/router';
import { UserDto, UserRole } from 'types/user.dto';

enum ClassroomTab {
  NEWS = 'NEWS',
  EXERCISE = 'EXERCISE',
  PEOPLE = 'PEOPLE',
  GRADE = 'GRADE',
}

function DetailClassPage() {
  const [role, setRole] = useState<UserRole | undefined>(undefined);

  const [currentTab, setCurrentTab] = useState<ClassroomTab>(ClassroomTab.NEWS);

  const router = useRouter();
  const id = router.query.id;

  const { data: classroom } = useQuery<ClassroomDto>(['class', id], () =>
    classApi.getClass(id as string)
  );

  const [session] = useSession();

  useEffect(() => {
    const checkRole = () => {
      const teacherIds = classroom?.teachers.map((teacher) => teacher.id);
      const studentIds = classroom?.students.map((student) => student.user.id);
      const userId = (session?.user as UserDto).id;

      if (teacherIds?.find((id) => id === userId)) {
        setRole(UserRole.TEACHER);
      }

      if (studentIds?.find((id) => id === userId)) {
        setRole(UserRole.STUDENT);
      }
    };

    checkRole();
  }, [session, classroom]);

  const navbarOptions: LayoutOptions[] = [
    {
      name: 'News',
      onClick: () => setCurrentTab(ClassroomTab.NEWS),
    },
    {
      name: 'Exercise',
      onClick: () => setCurrentTab(ClassroomTab.EXERCISE),
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
    [ClassroomTab.EXERCISE]: <ClassroomExercise />,
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
        <ClassroomStudentGrade classroom={classroom as ClassroomDto} />
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
