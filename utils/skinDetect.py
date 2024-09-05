import cv2
import numpy as np


def skin_detection(image):
    # Convert image to HLS color space
    hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    ycrcb_image = cv2.cvtColor(image, cv2.COLOR_BGR2YCrCb)

    # Define lower and upper threshold values for skin detection in HLS
    lower_bound_hsv = np.array([0, 15, 0])
    upper_bound_hsv = np.array([17, 170, 255])

    lower_bound_ycrcb = np.array([0, 135, 85], dtype=np.uint8)
    upper_bound_ycrcb = np.array([255, 180, 135], dtype=np.uint8)

    # Create a binary mask of potential skin regions
    hsv_mask = cv2.inRange(hsv_image, lower_bound_hsv, upper_bound_hsv)
    ycrcb_mask = cv2.inRange(ycrcb_image, lower_bound_ycrcb, upper_bound_ycrcb)

    global_mask = cv2.bitwise_and(hsv_mask, ycrcb_mask)

    return global_mask


# The mask passed in here should be derived from applying a mask to the bounding box surrounding a person in the image.
def skin_exposure(skin_mask):
    skin_pixels = cv2.countNonZero(skin_mask)
    total_pixels = skin_mask.shape[0] * skin_mask.shape[1]
    return skin_pixels / total_pixels
