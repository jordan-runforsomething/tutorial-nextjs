'use server'; // Makes all exported functions server functions. Can be imported to Client and Server components

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod'

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string()
})

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
      });
     
      const amountInCents = amount * 100;
     
      await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
     
      revalidatePath('/dashboard/invoices');
      redirect('/dashboard/invoices');

}

export async function createInvoice(formData: FormData) {
    throw new Error("Cannot create invoice")
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    const newInvoiceData = {
        customerId,
        amount: amount * 100,
        status,
        date: new Date().toISOString().split('T')[0]
    };
    // TODO: Use an ORM instead of this. We don't really have to write SQL, right?
    try {
        await sql`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${newInvoiceData.customerId}, ${newInvoiceData.amount}, ${newInvoiceData.status}, ${newInvoiceData.date})
        `;
    } catch (error) {
        return {
            message: 'DB Error!'
        }
    }
    
    // Test it out:
    // console.log(rawFormData);
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}