import os
from django.conf import settings
from google.cloud import storage
import threading


# TODO the whole way these images files are being handled needs to change. They shouldn't be living in the static folder
# they should be in a folder similar to the downloaded rasters and then server up by a controller.
class PngHandler:
    def __init__(self):
        print("hello")
        credential_path = os.path.join(settings.BASE_DIR, 'keys', 'cals-grazescape-files-63e6-4f2fc53201e6.json')
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credential_path
        self.model_list = ["ero", "ploss", "nleaching", "Rotational Average", "Curve Number"]
        self.threads = []
        # self.remove_old_pngs_from_local(bucket, str(field_id))

    def remove_pngs(self, field_id):
        for bucket in self.model_list:
            self.create_delete_thread(bucket, field_id)

        for thread in self.threads:
            thread.join()

    def remove_old_pngs_from_local(self, field_id):
        for bucket in self.model_list:
            images_folder_path = os.path.join(settings.BASE_DIR, 'grazescape', 'static', 'grazescape', 'public',
                                              'images')
            for filename in os.listdir(images_folder_path):
                if bucket + field_id in filename:
                    os.remove(os.path.join(images_folder_path, filename))
                else:
                    pass

    def create_delete_thread(self, model_type, field_id):
        download_thread = threading.Thread(target=self.remove_old_pngs_gcs_storage_bucket, args=(model_type, field_id))
        download_thread.start()
        self.threads.append(download_thread)

    def remove_old_pngs_gcs_storage_bucket(self, model_type, field_id):
        # print('hi there')
        """Lists all the blobs in the bucket."""
        # bucket_name = "your-bucket-name"

        storage_client = storage.Client()
        # print("deleting ", model_type)
        # Note: Client.list_blobs requires at least package version 1.17.0.
        blobs = storage_client.list_blobs(settings.GCS_BUCKET_NAME)
        for blob in blobs:
            # print(blob.name)
            if str(model_type + field_id) in blob.name:
                try:
                    blob.delete()
                    print("Blob " + model_type + field_id + " deleted.")
                except:
                    print("There was an error")
                    pass

    # Deletes model results from GCS bucket
    def delete_gcs_model_result_blob(self, field_id):
        # model_Types = ['Rotational Average', 'ploss', 'ero']
        storage_client = storage.Client()
        bucket = storage_client.bucket(settings.GCS_BUCKET_NAME)
        for model in self.model_list:
            """Deletes a blob from the bucket."""
            blob = bucket.blob(model + field_id + '.png')
            try:
                blob.delete()
                # print("Blob {} deleted.".format(field_id))
            except:
                print("There was an error")
                pass
        storage_client.close()

    # Uploads model results to GCS bucket
    def upload_gcs_model_result_blob(self, field_id, model_run_timestamp):
        """Uploads a file to the bucket."""
        # bucket_list = ["ero", "ploss", "nleaching", "Rotational Average", "Curve Number"]
        storage_client = storage.Client()
        for bucket in self.model_list:
            source_file_name = os.path.join(settings.BASE_DIR, 'grazescape', 'static', 'grazescape', 'public', 'images',
                                            bucket + field_id + '_' + model_run_timestamp + ".png")
            print("uploading file", source_file_name)
            # The ID of your GCS object
            destination_blob_name = bucket + field_id + '_' + model_run_timestamp + ".png"

            bucket = storage_client.bucket(settings.GCS_BUCKET_NAME)
            blob = bucket.blob(destination_blob_name)
            try:
                blob.upload_from_filename(source_file_name)

                # print( "File {} uploaded to {}.".format(source_file_name, destination_blob_name))
            except:
                print("THERE WAS AN ERROR WHILE UPLOADING " + destination_blob_name)

        storage_client.close()

    # Downloads model results from GCS bucket
    def download_gcs_model_result_blob(self, field_id, scen, active_scen, model_run_timestamp):
        """Downloads a blob from the bucket."""
        # model_Types = ['Rotational Average', 'ploss', 'ero', 'nleaching', "Curve Number"]
        storage_client = storage.Client()
        blobs = storage_client.list_blobs(settings.GCS_BUCKET_NAME)
        for blob in blobs:
            for model in self.model_list:
                if str(model + str(field_id)) in blob.name and str(scen) == str(active_scen):
                    # print("SCEN ACTIVE SCEN HIT!!!!!!!!")
                    model_run_timestamp = blob.name[-17:-4]
                    print(model_run_timestamp)
                    print(blob.name)
                    destination_file_name = os.path.join(settings.BASE_DIR, 'grazescape', 'static', 'grazescape',
                                                         'public',
                                                         'images', blob.name)
                    try:
                        blob.download_to_filename(destination_file_name)
                        # print("Blob {} downloaded.".format(field_id))
                    except:
                        print("There was an error")
        storage_client.close()
        return model_run_timestamp
