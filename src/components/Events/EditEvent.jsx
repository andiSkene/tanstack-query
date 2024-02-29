import { Link, useNavigate, useParams, redirect, useSubmit, useNavigation } from 'react-router-dom';
import { useQuery/*, useMutation*/ } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { fetchEvent, updateEvent, queryClient } from '../../util/http.js';

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();
  const submit = useSubmit();
  const { state } = useNavigation();

  const { data, isError, error } = useQuery({
    queryKey: ['event', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    staleTime: 10000
  });

  /*   const { mutate } = useMutation({
      mutationFn: updateEvent,
      onMutate: async (data) => {
        const newEvent = data.event
        await queryClient.cancelQueries(['event', params.id]);
  
        const previousEvent = queryClient.getQueryData(['event', params.id]);
        queryClient.setQueryData(['event', params.id], newEvent);
  
        return { previousEvent };
      },
      onError: (error, data, context) => {
        queryClient.setQueryData(['event', params.id], context.previousEvent);
      },
      onSettled: () => {
        queryClient.invalidateQueries(['event', params.id]);
      }
    })
   */
  let content;

  if (isError) {
    content = <>
      <ErrorBlock title="Failed to fetch event." message={error.info?.message || 'Failed to fetch event data.'} />
      <div className='form-actions'>
        <Link to='../' className='button'>
          Okay
        </Link>
      </div>
    </>
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === 'submitting' ? <p>Sending data...</p> : <>
          <Link to="../" className="button-text">
            Cancel
          </Link>
          <button type="submit" className="button">
            Update
          </button>
        </>}
      </EventForm>
    )
  }

  function handleSubmit(formData) {
    //mutate({ id: params.id, event: formData });
    //navigate('../');
    submit(formData, { method: 'PUT' });
  }

  function handleClose() {
    navigate('../');
  }

  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}

export function loader({ params }) {
  return queryClient.fetchQuery({
    queryKey: ['event', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id })
  })
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updatedEventData });
  await queryClient.invalidateQueries(['event']);
  return redirect('../');
}