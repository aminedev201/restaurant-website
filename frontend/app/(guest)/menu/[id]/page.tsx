import { Metadata } from "next";
import PlateDetailClient from "./PlateDetailClient";

interface Props {
  params: { id: string };
}

export const metadata: Metadata = {
  title: 'Menu Details',
  description: 'Explore our curated menu of Mediterranean and Moroccan-inspired dishes.',
};

export default function PlateDetailPage({ params }: Props) {
  return <PlateDetailClient id={Number(params.id)} />;
}