import axios from 'axios';
import * as React from 'react';
import ClassList from 'pages/class/ClassList';
import { InferGetStaticPropsType } from 'next';

type Post = {
  id: string;
  subject: string;
  description: string;
};

export const getStaticProps = async () => {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_GATEWAY}/classes`);
  const classes: Post[] = await res.data;
  return {
    props: {
      classes: classes,
    },
  };
};

function Classes({ classes }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div>
      <ClassList classes={classes}></ClassList>
    </div>
  );
}
export default Classes;
