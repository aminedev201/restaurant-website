
<?php

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

if (! function_exists('upload_with_random_name')) {
    /**
     * Upload a file with a random UUID + timestamp filename.
     *
     * @param  UploadedFile  $file
     * @param  string        $folder
     * @param  string        $disk
     * @return string        stored path
     */
    function upload_with_random_name(
        UploadedFile $file,
        string $folder = 'uploads',
        string $disk = 'public'
    ): string {
        $extension = $file->getClientOriginalExtension();
        $filename  = Str::uuid() . '_' . time() . '.' . $extension;

        return $file->storeAs($folder, $filename, $disk);
    }
}
