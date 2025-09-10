import type { XsdNode } from '@/types';

// This is now just a fallback or for the target schema
export const sourceSchema: XsdNode = {
  id: 'source-root',
  name: 'CustomerOrder',
  type: 'complexType',
  children: [
    {
      id: 'source-order-id',
      name: 'OrderID',
      type: 'xs:string',
    },
    {
      id: 'source-customer',
      name: 'CustomerInfo',
      type: 'complexType',
      children: [
        {
          id: 'source-first-name',
          name: 'FirstName',
          type: 'xs:string',
        },
        {
          id: 'source-last-name',
          name: 'LastName',
          type: 'xs:string',
        },
        {
          id: 'source-email',
          name: 'EmailAddress',
          type: 'xs:string',
        },
      ],
    },
    {
      id: 'source-shipping',
      name: 'ShippingAddress',
      type: 'complexType',
      children: [
        {
          id: 'source-street',
          name: 'Street',
          type: 'xs:string',
        },
        {
          id: 'source-city',
          name: 'City',
          type: 'xs:string',
        },
        {
          id: 'source-zip',
          name: 'PostalCode',
          type: 'xs:integer',
        },
      ],
    },
  ],
};

export const targetSchema: XsdNode = {
  id: 'target-root',
  name: 'SalesInvoice',
  type: 'complexType',
  children: [
    {
      id: 'target-invoice-id',
      name: 'InvoiceNumber',
      type: 'xs:string',
    },
    {
      id: 'target-buyer',
      name: 'BuyerInformation',
      type: 'complexType',
      children: [
        {
          id: 'target-full-name',
          name: 'FullName',
          type: 'xs:string',
        },
        {
          id: 'target-contact',
          name: 'ContactEmail',
          type: 'xs:string',
        },
      ],
    },
    {
      id: 'target-delivery',
      name: 'DeliveryLocation',
      type: 'complexType',
      children: [
        {
          id: 'target-address-line',
          name: 'AddressLine1',
          type: 'xs:string',
        },
        {
            id: 'target-town',
            name: 'Town',
            type: 'xs:string',
        },
        {
          id: 'target-postcode',
          name: 'Postcode',
          type: 'xs:string',
        },
      ],
    },
  ],
};
