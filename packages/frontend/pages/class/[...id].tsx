import axios from 'axios';
import { useRouter } from 'next/dist/client/router';
import * as React from 'react';

export interface DetailClassPageProps {
}

export default function DetailClassPage (props: DetailClassPageProps) {
    const router = useRouter();
  return (
    <div>
      <h1>{router.query.id}</h1>
    </div>
  );
}
