package com.example;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.google.gson.Gson;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Component
public class ProgressWebSocketHandler extends TextWebSocketHandler {

    private final AtomicInteger progress = new AtomicInteger(0);
    private WebSocketSession session;
    private ExecutorService executor = Executors.newSingleThreadExecutor();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        this.session = session;
        System.out.println("WebSocket connection established: " + session.getId());
    }

    public void sendProgressUpdate() throws IOException {
        if (this.session != null && this.session.isOpen()) {
            String message = String.valueOf(progress.get());
            this.session.sendMessage(new TextMessage(message));
        }
    }

    public String startSort(List<List<String>> table, List<Object> weightsSource, List<List<String>> groups, List<String> finalParams, List<List<Integer>> counts, String email, String password) {
        Callable<String> task = () -> {
            try {
                if (!AccountServices.verifyLogin(email, password)) {
                    return "{\"text\":\"INVALID\"}";
                }
                
                Sort bestSort = null;
                int iterFound = -1;
                ArrayList<Double> bestAverageUnhappinessOverIterations = null;
                for (int sortNum = 0; sortNum < Integer.parseInt(finalParams.get(2)); sortNum++) {
                    double[][] weights = {{((Number) weightsSource.get(0)).doubleValue()}, {((Number) weightsSource.get(1)).doubleValue()}, {((Number) weightsSource.get(2)).doubleValue()}, {((Number) weightsSource.get(3)).doubleValue()}, {((Number) weightsSource.get(4)).doubleValue()}, {((Number) weightsSource.get(5)).doubleValue()}, {((Number) weightsSource.get(6)).doubleValue()}, {((Number) weightsSource.get(7)).doubleValue()}, ((List<?>) weightsSource.get(8)).stream().mapToDouble(o -> ((Number) o).doubleValue()).toArray(), ((List<?>) weightsSource.get(9)).stream().mapToDouble(o -> ((Number) o).doubleValue()).toArray(), {Integer.parseInt(finalParams.get(0))}, ((List<?>) weightsSource.get(10)).stream().mapToDouble(o -> ((Number) o).doubleValue()).toArray(), ((List<?>) weightsSource.get(11)).stream().mapToDouble(o -> ((Number) o).doubleValue()).toArray(), ((List<?>) weightsSource.get(12)).stream().mapToDouble(o -> ((Number) o).doubleValue()).toArray()};
                    ArrayList<ArrayList<String>> input = table.stream().map(innerList -> new ArrayList<>(innerList)).collect(Collectors.toCollection(ArrayList::new));
                    Individual[] ind = new Individual[input.size() - 1];
                    for (int i = 1; i < input.size(); i++)
                        ind[i-1] = new Individual(input.get(i), input.get(0), new int[] {((Number) weightsSource.get(0)).intValue(), ((Number) weightsSource.get(1)).intValue(), ((Number) weightsSource.get(2)).intValue(), ((Number) weightsSource.get(3)).intValue(), ((Number) weightsSource.get(4)).intValue(), ((Number) weightsSource.get(5)).intValue(), ((Number) weightsSource.get(6)).intValue(), ((Number) weightsSource.get(7)).intValue(), ((Number) weightsSource.get(8)).intValue(), ((Number) weightsSource.get(9)).intValue(), ((Number) weightsSource.get(10)).intValue(), ((Number) weightsSource.get(11)).intValue(), ((Number) weightsSource.get(12)).intValue()}, weights);
                    ArrayList<ArrayList<String>> input1 = groups.stream().map(innerList -> new ArrayList<>(innerList)).collect(Collectors.toCollection(ArrayList::new));;;
                    Location[] l = new Location[input1.size()];
                    for (int i = 0; i < input1.size(); i++) {
                        // SOLUTION: maybe needed above with individuals as well, if there is an error, skip that location
                        try {
                            l[i] = new Location(Integer.parseInt(input1.get(i).get(1)), input1.get(i).get(0), Integer.parseInt(input1.get(i).get(2)), weights);
                        } catch (Exception e) {}
                    }

                    int nullCount = 0;
                    for (Individual i : ind) {
                    if (i.getName() == null)
                        nullCount++;
                    }

                    Individual[] ind1 = new Individual[ind.length - nullCount];
                    int counter = 0;
                    for (Individual i : ind) {
                        if (i.getName() != null) {
                            ind1[counter] = i;
                            counter++;
                        }
                    }
                    ind = ind1;

                    nullCount = 0;
                    for (Location i : l) {
                        if (i == null || i.getName() == null)
                            nullCount++;
                    }
                    
                    Location[] l1 = new Location[l.length - nullCount];
                    counter = 0;
                    for (Location i : l) {
                        // problem??
                        if (i != null && i.getName() != null) {
                            l1[counter] = i;
                            counter++;
                        }
                    }
                    l = l1;

                    Sort sort = new Sort(l, ind);
                    for (int i = 0; i < l.length; i++)
                        l[i].calculateMaxUnhappiness(sort);

                    int iter = Integer.parseInt(finalParams.get(1));
                    if (iter > 1000000) {
                        iter = 1000000;
                    }
                    ArrayList<Double> averageUnhappinessOverIterations = new ArrayList<>();

                    int iS = -1;
                    if (type.equals("normal")) {
                        sort.allChoiceAssignment();

                        double minTotalUnhappiness = sort.getUnhappiness();
                        iS = 0;
                        Sort minSort = sort.copy();

                        // TODO: Confirm that iteration actually helps
                        for (int i = 0; i < iter; i++) {
                            System.out.println("Iteration: " + i);
                            // TODO: What is the best setting for reassignX?
                            sort.reassignX(3);
                            sort.sumUnhappiness();
                            averageUnhappinessOverIterations.add(sort.getUnhappiness()/sort.getIndividuals().length);

                            if (sort.getUnhappiness() < minTotalUnhappiness) {
                                minTotalUnhappiness = sort.getUnhappiness();
                                minSort = sort.copy();
                                iS = i;
                            }
                        }

                        sort = minSort;
                    } else {
                        sort.randomAssignment();
                        sort.sumUnhappiness();
                    }
                    if (bestSort == null || bestSort.getUnhappiness() > sort.getUnhappiness()) {
                        bestSort = sort;
                        bestAverageUnhappinessOverIterations = averageUnhappinessOverIterations;
                        iterFound = iS;
                    }
                }

                ArrayList<String> names = new ArrayList<>();
                ArrayList<Integer> numbers = new ArrayList<>();
                for (Location i : bestSort.getLocations()) {
                    if (names.indexOf(i.getName()) == -1) {
                            names.add(i.getName());
                            numbers.add(1);
                        } else {
                            numbers.set(names.indexOf(i.getName()), numbers.get(names.indexOf(i.getName())) + 1);
                        }
                }
                for (int i = 0; i < numbers.size(); i++) {
                    if (numbers.get(i) == 1) {
                        numbers.remove(i);
                        names.remove(i);
                        i--;
                    }
                }
                for (Location i : bestSort.getLocations()) {
                    if (names.indexOf(i.getName()) != -1 && numbers.get(names.indexOf(i.getName())) >= 1) {
                        numbers.set(names.indexOf(i.getName()), numbers.get(names.indexOf(i.getName())) - 1);
                        i.setName(i.getName() + " " + (numbers.get(names.indexOf(i.getName()))+1));
                }
                }

                for (Location i : bestSort.getLocations()) {
                    for (Individual ii : i.getMembers()) {
                        ii.setFalseChoiceUnhappy();
                    }
                }
                bestSort.sumUnhappiness();

                Gson gson = new Gson();

                Map<String, Object> result = new LinkedHashMap<>();
                result.put("title", sortInput.getString());
                result.put("numberOfSorts", sortInput.getNumber3());
                result.put("averageUnhappiness", bestSort.getUnhappiness()/bestSort.getIndividuals().length);
                result.put("averageUnhappinessOverIterations", bestAverageUnhappinessOverIterations);
                result.put("iterFound", iterFound);

                List<String> locationNames = new ArrayList<>();
                for (Location i : bestSort.getLocations()) {
                    locationNames.add(i.getName());
                }
                List<List<String>> output = new ArrayList<>();
                output.add(locationNames);

                int max = 0;
                for (Location i : bestSort.getLocations())
                    if (i.getMembers().size() > max)
                        max = i.getMembers().size();

                for (int g = 0; g < max; g++) {
                    List<String> row = new ArrayList<>();
                    for (Location ii : bestSort.getLocations()) {
                        if (ii.getMembers().size() > g) {
                            row.add(ii.getMembers().get(g).getName());
                        } else {
                            row.add("");
                        }
                    }
                    output.add(row);
                }
                result.put("output", output);

                    List<List<String>> output1 = new ArrayList<>();

                    // Populate the first row with the column headers
                    List<String> header = new ArrayList<>();
                    header.add("Name");
                    header.add("Location");
                    for (String h : bestSort.getIndividuals()[0].getHeaders()) {
                        header.add(h);
                    }
                    output1.add(header);

                    for (Location i : bestSort.getLocations()) {
                        for (Individual ii : i.getMembers()) {
                            List<String> row = new ArrayList<>();
                            row.add(ii.getName()); // Individual's name
                            row.add(i.getName()); // Location
                            String[] choices = ii.getChoices();
                            for (String choice : choices) {
                                row.add(choice);
                            }
                            output1.add(row);
                        }
                    }
                    result.put("output1", output1);

                    List<List<Boolean>> output2 = new ArrayList<>();

                    for (Location i : bestSort.getLocations()) {
                        for (Individual ii : i.getMembers()) {
                            List<Boolean> row = new ArrayList<>();
                            row.add(i.isUnhappy());
                            boolean[] choices = ii.getChoiceUnhappy();
                            for (boolean choice : choices) {
                                row.add(choice);
                            }
                            output2.add(row);
                        }
                    }
                    result.put("output2", output2);

                String jsonString = gson.toJson(result);

                if (type.equals("normal")) {
                    AccountFunctions.incrementSortCount(sortInput.getEmail(), 0);
                    System.out.println("Sort Completed: title=" + sortInput.getString() + " iterations=" + sortInput.getNumber2() + " number of sorts=" + sortInput.getNumber3());
                } else {
                    AccountFunctions.incrementSortCount(sortInput.getEmail(), 1);
                    System.out.println("Random Sort Completed: title=" + sortInput.getString() + " number of sorts=" + sortInput.getNumber3());
                }

                return jsonString;
            } catch (InterruptedException | IOException e) {
                Thread.currentThread().interrupt();
                System.err.println("Error during sorting process: " + e.getMessage());
                return "{\"text\":\"ERROR\"}";
            }
        };

        Future<String> future = executor.submit(task);
        try {
            return future.get(); // Retrieve the result of the task
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error retrieving sorting result: " + e.getMessage());
            return "{\"text\":\"ERROR\"}";
        }
    }

    public void shutdown() {
        executor.shutdown();
    }
}