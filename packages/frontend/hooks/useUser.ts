import classApi from 'api/class';
import { useSession } from 'next-auth/client';
import { useQuery } from 'react-query';
import { ClassroomDto } from 'types/classroom.dto';
import { UserDto, UserRole } from 'types/user.dto';

const useUser = (classroomId: string) => {
  const [session] = useSession();

  const { data: classroom } = useQuery<ClassroomDto>(
    ['class', classroomId],
    () => classApi.getClass(classroomId)
  );

  const user = session?.user as UserDto;

  const checkRole = (): UserRole | undefined => {
    const teacherIds = classroom?.teachers.map((teacher) => teacher.id);
    const studentIds = classroom?.students.map((student) => student.user?.id);
    const userId = session?.user && (session?.user as UserDto).id;

    if (teacherIds?.find((id) => id === userId)) {
      return UserRole.TEACHER;
    }

    if (studentIds?.find((id) => id === userId)) {
      return UserRole.STUDENT;
    }
  };

  const role: UserRole | undefined = checkRole();

  return {
    email: user?.email,
    id: user?.id,
    name: (user as unknown as { name: string })?.name,
    role,
  };
};

export default useUser;
