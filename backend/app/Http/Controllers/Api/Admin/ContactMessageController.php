<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    /**
     * GET /admin/contact-messages
     */
    public function index(): JsonResponse
    {
        $messages = ContactMessage::latest()->get();

        return response()->json([
            'status'  => true,
            'message' => 'Contact messages fetched successfully.',
            'data'    => $messages,
        ]);
    }

    /**
     * GET /admin/contact-messages/{id}
     */
    public function show(ContactMessage $contactMessage): JsonResponse
    {
        return response()->json([
            'status'  => true,
            'message' => 'Contact message read successfully.',
            'data'    => $contactMessage,

        ]);
    }

     /**
     * POST /admin/contact-messages/{id}/read
     */
    public function read(ContactMessage $contactMessage): JsonResponse
    {
        if ($contactMessage->status === 'unread') {
            $contactMessage->update(['status' => 'read']);
        }

        return response()->json([
            'status'  => true,
            'message' => 'Contact message read successfully.',
        ]);
    }

    /**
     * DELETE /admin/contact-messages/{id}
     */
    public function destroy(ContactMessage $contactMessage): JsonResponse
    {
        $contactMessage->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Message deleted successfully.',
        ]);
    }

    /**
     * DELETE /admin/contact-messages/destroy-selected
     */
    public function destroySelected(Request $request): JsonResponse
    {
        $request->validate([
            'ids'   => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'exists:contact_messages,id'],
        ]);

        $messages = ContactMessage::whereIn('id', $request->input('ids'))->get();

        if ($messages->isEmpty()) {
            return response()->json([
                'status'  => false,
                'message' => 'No messages found for the given IDs.',
            ], 404);
        }

        $count = $messages->count();
        ContactMessage::whereIn('id', $request->input('ids'))->delete();

        return response()->json([
            'status'        => true,
            'message'       => $count . ' message(s) deleted successfully.',
            'deleted_count' => $count,
        ]);
    }
}
