const data = async () => {
    const tasks = await eel.getLists()();
    const nextSevenDays = [];
    let completed = 0;
    let incomplete = 0;
    let overdue = 0
    
    for (let i=1; i <= 7; i++) {
        nextSevenDays.push(moment(new Date()).add(i, 'days').format('YYYY-MM-DD'));
    }

    const nextSevenDayTasks = new Array(7).fill(0);
    const nextSevenDayCompleted = new Array(7).fill(0);

    const lastThirtyDays = [...new Array(30)].map((i, index) => moment().startOf('day').subtract(index, 'days').format('YYYY-MM-DD'));
    const lastThirtyDayCompleted = new Array(30).fill(0);
    const lastThirtyDayOverdue = new Array(30).fill(0);

    for (let i=0; i < tasks.length; i++) {
        for (let j=0; j < (tasks[i]._List__tasks).length; j++) {
            const task = tasks[i]._List__tasks[j];
            const deadline = task._deadline.split(':')[1].split('/');
            // Data for doughnut chart
            if (task._overdue) {
                overdue++;
            }
            else if (task._completed) {
                completed++;
            }
            else {
                incomplete++;
            }
            // Data for stacked bar chart
            nextSevenDays.forEach((day, index) => {
                if (moment(`${deadline[2]}-${deadline[1]}-${deadline[0]}`).isSame(day, 'day')) {
                    nextSevenDayTasks[index] += 1;
                    if (task._completed) {
                        nextSevenDayCompleted[index] += 1;
                    }
                }
            });
            
            // Data for line chart
            lastThirtyDays.forEach((day, index) => {
                if (moment(`${deadline[2]}-${deadline[1]}-${deadline[0]}`).isSame(day, 'day')) {
                    console.log('1');
                    if (task._overdue) {
                        lastThirtyDayOverdue[index] += 1;
                    }
                    if (task._completed) {
                        lastThirtyDayCompleted[index] += 1;
                    }
                }
            });
        }
    }

    return { 
        completed, 
        incomplete, 
        overdue, 
        // next seven days data
        nextSevenDays, 
        nextSevenDayTasks, 
        nextSevenDayCompleted,
        // last thirty days data
        lastThirtyDays,
        lastThirtyDayCompleted,
        lastThirtyDayOverdue
    }; 
};


$(document).on('ready', function() {
    $('.chart').hide();
    $('.chart__back').on('click', function() {
        $('.chart-button').fadeIn('fast');
        $('.chart').hide();
        $('.chart > div:last-child').children().remove();
        $('#list').fadeIn('fast');
    });

    $('.chart-button').on('click', async function() {
        const { completed, 
            incomplete, 
            overdue, 
            nextSevenDays, 
            nextSevenDayTasks, 
            nextSevenDayCompleted,
            lastThirtyDays,
            lastThirtyDayCompleted,
            lastThirtyDayOverdue } = await data();

        console.log(lastThirtyDays, lastThirtyDayOverdue, lastThirtyDayCompleted);
        $('#list').fadeOut('fast');
        $(this).fadeOut('fast', () => {
            $(this).next().show();
            
            $($('<div>', { class: 'doughnutChart' })).append(
                $('<canvas>', {
                    id: 'doughnutChart',
                    width: '100',
                    height: '100'
                })
            )
            .appendTo($('.chart > div:last-child'));
            
            $($('<div>', { class: 'barChart' })).append(
                $('<canvas>', {
                    id: 'barChart',
                    width: '300',
                    height: '300'
                })
            )
            .appendTo($('.chart > div:last-child'));

            $($('<div>', { class: 'lineChart' })).append(
                $('<canvas>', {
                    id: 'lineChart',
                    width: '300',
                    height: '300'
                })
            )
            .appendTo($('.chart > div:last-child'));

            const doughnutData = {
                labels: [
                    'Completed',
                    'Incomplete',
                    'Overdue'
                ],
                datasets: [{
                    label: 'My First Dataset',
                    data: [completed, incomplete, overdue],
                    backgroundColor: [
                        'rgb(255, 99, 132)',
                        'rgb(54, 162, 235)',
                        'rgb(255, 205, 86)'
                    ],
                    hoverOffset: 18
                }]
            };
        
            new Chart(
                $('#doughnutChart'),
                // config
                {
                    type: 'doughnut',
                    data: doughnutData,
                    options: {
                        layout: {
                            padding: 14
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    font: {
                                        size: 16,
                                        family: "'circularstdbook'"
                                    }
                                }
                            }
                        }
                    }
                }
            );

            const barData = {
                labels: nextSevenDays,
                datasets: [{
                        label: 'Tasks',
                        data: nextSevenDayTasks,
                        backgroundColor: [
                            'rgb(255, 99, 132)'
                        ],
                        borderColor: [
                            'rgb(255, 255, 255)'
                        ],
                        borderWidth: 1
                    }, 
                    {
                        label: 'Completed',
                        data: nextSevenDayCompleted,
                        backgroundColor: [
                            'rgb(255, 205, 86)'
                        ],
                        borderColor: [
                            'rgb(255, 255, 255)'
                        ],
                        borderWidth: 1
                    }
                ]
            }; 

            new Chart(
                $('#barChart'),
                // config
                {
                    type: 'bar',
                    data: barData,
                    options: {
                        layout: {
                            padding: 14
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                // stacked: true
                            },
                            y: {
                                beginAtZero: true,
                                // stacked: true,
                                ticks: {
                                    stepSize: 0.5
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: {
                                    font: {
                                        size: 16,
                                        family: "'circularstdbook'"
                                    }
                                }
                            }
                        }
                    },
                }
            );

            const lineData = {
                labels: lastThirtyDays,
                datasets: [{
                    label: 'Completed',
                    data: lastThirtyDayCompleted,
                    fill: false,
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                },
                {
                    label: 'Overdue',
                    data: lastThirtyDayOverdue,
                    fill: false,
                    borderColor: 'rgb(54, 162, 235)',
                    tension: 0.1
                }]
            };
            new Chart(
                $('#lineChart'),
                // config
                {
                    type: 'line',
                    data: lineData,
                    options: {
                        transitions: {
                            show: {
                                animations: {
                                    y: {
                                        from: 0
                                    }
                                }
                            },
                            hide: {
                                animations: {
                                    y: {
                                        to: 0
                                    }
                                }
                            }
                        },
                        layout: {
                            padding: 14
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: {
                                    font: {
                                        size: 16,
                                        family: "'circularstdbook'"
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                // stacked: true,
                                ticks: {
                                    stepSize: 0.5
                                }
                            }
                        }
                    }
                }
            );

        });
    });
});