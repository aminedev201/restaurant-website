import { Metadata } from "next";
import PlateDetailClient from "./PlateDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Menu Details",
  description:
    "Explore our curated menu of Mediterranean and Moroccan-inspired dishes.",
};

export default async function PlateDetailPage({ params }: Props) {
  const { id } = await params;

  return <PlateDetailClient id={Number(id)} />;
}