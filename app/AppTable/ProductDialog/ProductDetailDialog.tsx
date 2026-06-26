/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

import { useProductStore } from "@/app/useProductStore";
import { Product } from "@/app/types";





export default function ProductDetailDialog() {
  const {
    setOpenProductDetailDialog,
    openProductDetailDialog,
    selectedProductHistory,
  } = useProductStore();

  const handleOpenChange = (open: boolean) => {
    setOpenProductDetailDialog(open);
  };

  const history = selectedProductHistory || [];

  return (
    <Dialog open={openProductDetailDialog} onOpenChange={handleOpenChange}>
      <DialogContent className="p-4 sm:p-7 sm:px-8 poppins max-h-[90vh] overflow-y-auto">

        <DialogHeader>
          <DialogTitle className="text-[22px]">
            Product Stock History
          </DialogTitle>
        </DialogHeader>

        <DialogDescription>
          Stock movement history
        </DialogDescription>

        {history.length === 0 ? (
          <p className="text-center text-gray-500">
            No stock history found
          </p>
        ) : (
          <table className="w-full border mt-5">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Quantity</th>
                <th className="p-2 text-left">Change</th>
              </tr>
            </thead>

            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-2">
                    {new Date(item.date).toLocaleDateString("en-GB")}
                  </td>

                  <td className="p-2">{item.quantity}</td>

                  <td
                    className={`p-2 ${
                      item.change.includes("+")
                        ? "text-green-600"
                        : item.change.includes("-")
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {item.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DialogContent>
    </Dialog>
  );
}