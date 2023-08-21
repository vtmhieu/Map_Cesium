import matplotlib.pyplot as plt
import json

# Load data from the first JSON file (data.json)
with open("./measure/result/adaptive_2000/adaptive1.json") as f:
    data = json.load(f)

# Extract "time" and "processing" values into separate lists from data.json
time_values = [item["time"] for item in data]
processing_values = [item["processing"] for item in data]

# Load data from the second JSON file (data1.json)
with open("./measure/result/static_2000/static2.json") as f1:
    data1 = json.load(f1)

# Extract "time" and "processing" values into separate lists from data1.json
time_values1 = [item["time"] for item in data1]
processing_values1 = [item["processing"] for item in data1]

# Plot the first line graph (from data.json)
plt.plot(
    time_values,
    processing_values,
    color="red",
    marker="o",
    linestyle="-",
    label="Adaptive Tiling",
)

# Plot the second line graph (from data1.json)
plt.plot(
    time_values1,
    processing_values1,
    marker="x",
    linestyle="--",
    label="Static Tiling",
)

plt.xlabel("Time (seconds)", fontsize=20)  # Set x-axis label and font size
plt.ylabel("Processing Tiles", fontsize=20)  # Set y-axis label and font size
plt.title(
    "Rendering Time For Maximum 2000 Triangels Per Tile", fontsize=20
)  # Set plot title and font size
plt.legend(fontsize=20)  # Set legend font size
plt.xticks(fontsize=20)  # Set x-axis tick label font size
plt.yticks(fontsize=20)  # Set y-axis tick label font size
plt.grid(True)
plt.show()
