import cv2

url = "http://152.20.19.147:8080/video"

cap = cv2.VideoCapture(url)

while True:
    ret, frame = cap.read()

    if not ret:
        print("Camera disconnected")
        break

    cv2.imshow("Mobile Camera", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()