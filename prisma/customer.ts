import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createCustomer = async (data: {
  name: string;
  phone: string;
  address: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}) => {
  return prisma.customer.create({
    data,
  });
};

export const getCustomersByUser = async (userId: string) => {
  return prisma.customer.findMany({
    where: { userId },
    include: {
      orders: {
        include: {
          items: {
            include: { product: true },
          },
        },
      },
    },
  });
};

export const updateCustomer = async (
  id: string,
  data: {
    name?: string;
    phone?: string;
    address?: string;
    updatedAt?: Date;
  }
) => {
  return prisma.customer.update({
    where: { id },
    data,
  });
};

export const deleteCustomer = async (id: string) => {
  return prisma.customer.delete({
    where: { id },
  });
};
