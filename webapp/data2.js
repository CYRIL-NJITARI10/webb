document.addEventListener("DOMContentLoaded", function () {
  d3.select("body").style("background-color", "#e0f0f5");
  d3.csv("/students.csv").then(function (data) {
    console.log(data);
    let schoolCount = {};
    data.forEach((row) => {
      const school = row.school;
      if (!schoolCount[school]) {
        schoolCount[school] = 0;
      }
      schoolCount[school] += 1;
    });
    console.log(schoolCount);
    const schools = Object.keys(schoolCount);
    const counts = Object.values(schoolCount);

    // Create an array of objects for each school and its count
    const chartData = schools.map((school, index) => ({
      school: school,
      count: counts[index],
    }));

    // Sort the chart data by count in descending order
    chartData.sort((a, b) => b.count - a.count);

    // Get the top 5 schools and their counts
    const topSchools = chartData.slice(0, 5);

    // Extract the school names and counts for chart rendering
    const topSchoolNames = topSchools.map((school) => school.school);
    const topSchoolCounts = topSchools.map((school) => school.count);

    // Chart with the top 5 schools and their counts
    const chart = c3.generate({
      bindto: "#chart",
      data: {
        columns: [["Occurrence", ...topSchoolCounts]],
        type: "bar",
      },
      axis: {
        x: {
          type: "category",
          categories: topSchoolNames,
        },
      },
    });
    
  
  
  });
});
