from abc import ABC, abstractmethod
from PIL import Image
import numpy as np
from pyper import R
from django.conf import settings
import os
import json
import uuid



class ModelBase:

    def __init__(self, request, file_name=None):

        if file_name is None:
            file_name = str(uuid.uuid4())
        self.file_name = file_name
        self.model_data_inputs_path = os.path.join(settings.BASE_DIR, 'grazescape', 'data_files', 'raster_outputs',
                                                   file_name + '.csv')

        if not os.path.exists(os.path.join(settings.BASE_DIR, 'grazescape', 'data_files', 'raster_outputs')):
            os.makedirs(os.path.join(settings.BASE_DIR, 'grazescape', 'data_files', 'raster_outputs'))
        self.raster_image_file_path = os.path.join(settings.BASE_DIR, 'grazescape', 'data_files', 'raster_outputs',
                                                   file_name + ".png")

        self.r_file_path = "C://Program Files/R/R-4.0.4/bin/x64/R.exe"
        self.model_file_path = os.path.join(settings.BASE_DIR, 'grazescape', 'data_files', 'input_models')
        self.color_ramp_hex = []
        self.data_range = []
        self.model_parameters = request
        self.bounds = {"x": 0, "y": 0}
    def get_file_name(self):
        return self.file_name

    @abstractmethod
    def run_model(self):
        pass

    @abstractmethod
    def write_model_input(self):
        pass

    def to_raster_space(self, extents):
        # actual values of extents bounding box
        area_extents = [440000, 314000, 455000, 340000]
        m_extent = extents

        m_x1 = int(round(float(m_extent[0]) / 10.0) * 10)
        m_y1 = int(round(float(m_extent[1]) / 10.0) * 10)
        m_x2 = int(round(float(m_extent[2]) / 10.0) * 10)
        m_y2 = int(round(float(m_extent[3]) / 10.0) * 10)
        # Checking if bounding box is outside area extents
        if m_x1 < area_extents[0]:
            m_x1 = area_extents[0]
        elif m_x1 > area_extents[2]:
            m_x1 = area_extents[2]

        if m_x2 < area_extents[0]:
            m_x2 = area_extents[0]
        elif m_x2 > area_extents[2]:
            m_x2 = area_extents[2]

        if m_y1 < area_extents[1]:
            m_y1 = area_extents[1]
        elif m_y1 > area_extents[3]:
            m_y1 = area_extents[3]

        if m_y2 < area_extents[1]:
            m_y2 = area_extents[1]
        elif m_y2 > area_extents[3]:
            m_y2 = area_extents[3]

        m_extent[0] = m_x1
        m_extent[1] = m_y1
        m_extent[2] = m_x2
        m_extent[3] = m_y2

        # // re-index
        m_x1 = int((m_x1 - area_extents[0]) / 10)
        m_y1 = int(-(m_y1 - area_extents[3]) / 10)

        m_x2 = int((m_x2 - area_extents[0]) / 10)
        m_y2 = int(-(m_y2 - area_extents[3]) / 10)

        m_extent[0] = (round(m_extent[0] / 10.0) * 10)
        m_extent[1] = (round(m_extent[1] / 10.0) * 10)
        m_extent[2] = (round(m_extent[2] / 10.0) * 10)
        m_extent[3] = (round(m_extent[3] / 10.0) * 10)

        return [m_x1, m_y1, m_x2, m_y2], m_extent

    def clip_input(self, extents, input_raster_dic):
        """
        Parameters
        ----------
        extents
        input_raster_dic

        Returns
        -------
        """
        clipped_raster_dic = {}
        y1 = extents[3]
        x1 = extents[0]
        y2 = extents[1]
        x2 = extents[2]
        print(y1, x1, x2, y2)
        for key in input_raster_dic:
            clipped_raster_dic[key] = input_raster_dic[key][y1:y2, x1:x2]
        self.bounds["x"] = x2 - x1
        self.bounds["y"] = y2 - y1
        return clipped_raster_dic, self.bounds

    def create_color_ramp(self, min_value, max_value, num_cat=9):
        interval_step = (max_value - min_value) / num_cat
        cate_value = min_value
        cat_list = []
        print(max_value)
        print(min_value)
        self.color_ramp_hex = [
            "#204484",
            "#3e75b2",
            "#90b9e4",
            "#d2f0fa",
            "#fcffd8",
            "#ffdaa0",
            "#eb9159",
            "#d25c34",
            "#a52d18"
        ]
        color_ramp = [(32, 68, 132),
                           (62, 117, 178),
                           (144, 185, 228),
                           (210, 240, 250),
                           (252, 255, 216),
                           (255, 218, 160),
                           (235, 145, 89),
                           (210, 92, 52),
                           (165, 45, 24)
                           ]
        counter = 0
        self.data_range.append(min_value)
        while counter < num_cat:
            cat_list.append([cate_value, cate_value + interval_step, color_ramp[counter]])
            cate_value = cate_value + interval_step
            self.data_range.append(cate_value)
            counter = counter + 1
        return cat_list

    def calculate_color(self, color_ramp, value):
        for index, val in enumerate(color_ramp):
            if val[1] >= value:
                return val[2]
        return color_ramp[-1][2]

    def reshape_model_output(self, data, bounds):
        data = np.reshape(data, (bounds["y"], bounds["x"]))
        return data

    def get_model_raster(self, data):
        max_v = max(data)
        min_v = min(data)
        rows = self.bounds["y"]
        cols = self.bounds["x"]

        three_d = np.empty([rows, cols, 3])
        datanm = self.reshape_model_output(data,self.bounds)
        color_ramp = self.create_color_ramp(min_v, max_v)
        for y in range(0, rows):
            for x in range(0, cols):
                color = self.calculate_color(color_ramp, datanm[y][x])
                # if color is None:
                #     print(datanm[y][x])
                three_d[y][x][0] = color[0]
                three_d[y][x][1] = color[1]
                three_d[y][x][2] = color[2]
        three_d = three_d.astype(np.uint8)
        im = Image.fromarray(three_d, mode='RGB')
        im.convert('RGB')
        print("raster image")
        print(self.raster_image_file_path)
        im.save(self.raster_image_file_path)
        return color_ramp

    def get_legend(self):
        return self.color_ramp_hex, self.data_range
    def aggregate(self, data):
        return np.mean(data)
