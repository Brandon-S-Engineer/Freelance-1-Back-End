'use client';

import { useParams } from 'next/navigation';

import { useOrigin } from '@/hooks/use-origin';
import { ApiAlert } from '@/components/ui/api-alert';

interface ApiListProps {
  entityName: string;
  entityIdName: string;
}

export const ApiList: React.FC<ApiListProps> = ({ entityName, entityIdName }) => {
  const params = useParams(); // Dynamic parameters from the route
  const origin = useOrigin(); // Get the origin URL

  // Construct the base URL for API endpoints using storeId from params
  const baseUrl = `${origin}/api/${params.storeId}`;

  return (
    <>
      {/* Display API alerts for various HTTP methods */}
      <ApiAlert
        title='GET'
        variant='public'
        description={`${baseUrl}/${entityName}`} // Endpoint for listing all entities
      />

      <ApiAlert
        title='GET'
        variant='public'
        description={`${baseUrl}/${entityName}/${entityIdName}`} //? Endpoint for retrieving a specific entity by ID
      />

      <ApiAlert
        title='POST'
        variant='admin'
        description={`${baseUrl}/${entityName}`} // Endpoint for creating a new entity
      />

      <ApiAlert
        title='PATCH'
        variant='admin'
        description={`${baseUrl}/${entityName}`} // Endpoint for updating an existing entity
      />

      <ApiAlert
        title='DELETE'
        variant='admin'
        description={`${baseUrl}/${entityName}`} // Endpoint for deleting an entity
      />
    </>
  );
};
