#include<time.h>
#include<stdlib.h>
#include <iostream>
// The std::chrono namespace provides timer functions in C++
#include <chrono>
#include <random>
#include <cstddef>
#include <omp.h>
#include <math.h>
// #include "gdal_priv.h"
// std::ratio provides easy conversions between metric units
#include <ratio>
using std::cout;
using std::chrono::high_resolution_clock;
using std::chrono::duration;
const size_t TEST_SIZE = 1000;
const size_t TEST_MAX = 32;
class BirdModel{
    public:

    double run_model(){
            int n = 300;
            int n2 = 300;
            int b = 3;
            int t = 10;


            high_resolution_clock::time_point start;
            high_resolution_clock::time_point end;
            duration<double, std::milli> duration_sec;

            start = high_resolution_clock::now();

            // int radius = box/2;
            // cout<< "radius "<<radius<<"\n";
            #pragma omp parallel for collapse(2)

            for (int i = 0; i < row ; i++) {
                for (int j = 0; j < col ; j++) {
                    int current_val =  a[i][j];
                    // cout<< "current val "<< a[i][j]<<"\n";
                    if (current_val != no_data){
                    for (int k = -radius; k <= radius ; k++) {
                            for (int p = -radius; p <= radius ; p++) {
                                int cur_row = i+k;
                                int cur_col = j+p;
                                // cout<< "    current coordinates" <<cur_row<<" "<< cur_col<< "\n";
                                if(cur_row < 0 || cur_row >= row){
                                    continue;
                                }
                                if(cur_col < 0 || cur_col >= col){
                                    continue;
                                }
                                int cur_val_box = a[cur_row][cur_col];
                                // cout<< "   current box val "<< cur_val_box<<"\n";
                                if (cur_val_box == -9999){
                                    arr_no_data[i][j] = arr_no_data[i][j] + 1;
                                }
                                else if (3 <= cur_val_box && cur_val_box <= 7){

                                    ag[i][j] = ag[i][j]+ 1;
                                    valid_cells[i][j] = valid_cells[i][j] + 1;

                                }
                                else if( 8 <= cur_val_box && cur_val_box <= 10){

                                    grass[i][j] = grass[i][j] + 1;
                                    valid_cells[i][j] = valid_cells[i][j] + 1;
                                }
                                else{
                                    valid_cells[i][j] = valid_cells[i][j] + 1;
                                }
                            }
                        }
                    }
                    else{

                        arr_is_no_data[i][j] = 1;
                    }

                }

            }
            // total_cells = 0;
            // index_sum = 0;
            int total_cells1 = 0;
            double sum2 = 0;
            #pragma omp parallel for simd collapse(2) reduction(+:sum2,total_cells1)

            for (int i = 0; i < row ; i++) {
                for (int j = 0; j < col ; j++) {
                    int current_val =  a[i][j];
                    if (arr_is_no_data[i][j] != 1){
                        if (current_val > 0){
                            // total_cells += 1;
                            int index_count = index_count + 1;
                            int num_valid_cells = valid_cells[i][j];
                            // cout << "valid cells " << num_valid_cells << "\n";

                            double ag_per = ag[i][j]/num_valid_cells;
                            double grass_per = grass[i][j]/num_valid_cells;
                            double calc_lambda = - 4.47 + (2.95 * ag_per) + (5.17  * grass_per);
                            double inner1 = exp(calc_lambda);
                            double inner2 = (1/inner1) + 1;
                            double inner3 = 1/inner2;
                            // double inner4 = inner3 / 0.67;

                            // land_code = int(selected_landuse[i][j])
                            // if (land_code> 0){

                                // results_holder[land_code] = results_holder[land_code] + inner4
                            // }
                            // else{

                            // index_sum = index_sum + inner3 / 0.67;
                            output[i][j] = inner3 / 0.67;
                            sum2 = sum2 + inner3 / 0.67;
                            total_cells1 = total_cells1 + 1;
                            // }
                        }
                }

                }
            }
            sum1 = 0;

            for (int i = 0; i < row ; i++) {
                for (int j = 0; j < col ; j++) {
                    // cout << "value " << output[i][j] << "\n";

                    sum1 = sum1 + output[i][j];
                }
            }

                // #pragma omp parallel for simd reduction(+:sum2)
                // for (int i = 0; i < row ; i++) {
                //     for (int j = 0; j < col ; j++) {
                //         sum2=sum2+output[i][j];
                //     }
                // }

            end = high_resolution_clock::now();
            // Convert the calculated duration to a double using the standard library
            duration_sec = std::chrono::duration_cast<duration<double, std::milli>>(end - start);
            cout << "Total time: " << duration_sec.count() << "ms\n";
            cout << "Results " << sum1/total_cells << "\n";
            cout << "sum " << sum1 << "\n";
            cout << "sum2 " << sum2 << "\n";
            cout << "total cells " << total_cells << "\n";
            cout << "total cells 1 " << total_cells1 << "\n";






            delete[] a;
            }
    }
