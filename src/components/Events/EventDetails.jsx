import { useState } from 'react';
import { Link, Outlet, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

import Header from '../Header.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import Modal from '../UI/Modal.jsx';
import { fetchEvent, deleteEvent, queryClient } from '../../util/http.js';

export default function EventDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isPending, error, isError } = useQuery({
    queryKey: ['event-item', { id: params.id }],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id })
  });

  const { mutate, isPending: isPendingDeletion, isError: isErrorDeleting, error: errorDeletion } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      navigate('/events');
    }
  })

  let content;

  if (isPending) {
    content = <div id='event-details-content' className='center'>
      <LoadingIndicator />
    </div>
  }

  if (isError) {
    content = <ErrorBlock title='Failed to find an event.' message={
      error.info?.message || 'Failed to find an event. Please try again later.'
    } />
  }

  function deleteHandler() {
    mutate({ id: params.id });
  }

  function handleStartDelete() {
    setIsDeleting(true);
  }

  function handleStopDelete() {
    setIsDeleting(false);
  }

  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    content = <article id="event-details">
      <header>
        <h1>{data.title}</h1>
        <nav>
          <button onClick={handleStartDelete}>Delete</button>
          <Link to="edit">Edit</Link>
        </nav>
      </header>
      <div id="event-details-content">
        <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
        <div id="event-details-info">
          <div>
            <p id="event-details-location">{data.location}</p>
            <time dateTime={`Todo-DateT$Todo-Time`}>{formattedDate} @ {data.time}</time>
          </div>
          <p id="event-details-description">{data.description}</p>
        </div>
      </div>
    </article>

  }

  return (
    <>
      {isDeleting && <Modal onClose={handleStopDelete}>
        <h2>Are you sure?</h2>
        <p>Do you really want to delete this event? This action cannot be undone.</p>
        <div className='form-actions'>
          {isPendingDeletion && <p>Is deleting. Please wait...</p>}
          {!isPendingDeletion && (<>
            <button onClick={handleStopDelete} className='button-text'>Cancel</button>
            <button onClick={deleteHandler} className='button'>Delete</button>
          </>)}
        </div>
        {isErrorDeleting && <ErrorBlock title='Failed to delete event.' message={errorDeletion.info?.message || 'Failed to delete event. Please try again later.'} />}
      </Modal>}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {content}
    </>
  )
}
