import matplotlib.pyplot as plt
import json

# dictionary = json.load(open('../result/test.json', 'r'))
# xAxis = [key for key, value in dictionary.items()]
# yAxis = [value for key, value in dictionary.items()]
# plt.grid(True)

# ## LINE GRAPH ##
# plt.plot(xAxis,yAxis, color='maroon', marker='o')
# plt.xlabel('variable')
# plt.ylabel('value')

# ## BAR GRAPH ##
# fig = plt.figure()
# plt.bar(xAxis,yAxis, color='maroon')
# plt.xlabel('variable')
# plt.ylabel('value')

# plt.show()
import matplotlib.pyplot as plt
import json

# Load data from the JSON file
with open("data.json") as f:
    data = json.load(f)

# Extract "time" and "processing" values into separate lists
time_values = [item["time"] for item in data]
processing_values = [item["processing"] for item in data]

# Plot the line graph
plt.plot(time_values, processing_values, marker="o", linestyle="-")
plt.xlabel("Time")
plt.ylabel("Number of Rendering Tiles")
plt.title("Rendering Process of Adaptive Tiling")
plt.grid(True)
plt.show()
