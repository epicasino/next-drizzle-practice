import Image from 'next/image';
import { getData } from '../actions/todoActions';
import Todos from './components/Todos';

export default async function Home() {
  const data = await getData();
  return <Todos todos={data} />;
}
