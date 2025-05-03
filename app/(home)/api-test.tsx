import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useNotification } from "@/lib/context/NotificationContext";
import NetInfo from "@react-native-community/netinfo";

interface ApiResponse {
  status: "loading" | "success" | "error";
  data: any;
  error?: string;
}

interface NetworkState {
  isConnected: boolean | null;
  type: string | null;
  details: string | null;
}

export default function ApiTest() {
  const [apiResponse, setApiResponse] = useState<ApiResponse>({
    status: "loading",
    data: null,
  });
  const [endpoint, setEndpoint] = useState("https://jsonplaceholder.typicode.com/posts/1");
  const { showNotification } = useNotification();
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: null,
    type: null,
    details: null,
  });

  // Monitor network state
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkState({
        isConnected: state.isConnected,
        type: state.type,
        details: state.isConnected 
          ? `Connected (${state.type})${state.details?.isConnectionExpensive ? ' - Expensive' : ''}` 
          : 'Disconnected'
      });
    });

    // Get initial state
    NetInfo.fetch().then(state => {
      setNetworkState({
        isConnected: state.isConnected,
        type: state.type,
        details: state.isConnected 
          ? `Connected (${state.type})${state.details?.isConnectionExpensive ? ' - Expensive' : ''}` 
          : 'Disconnected'
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchApi = async (url: string) => {
    // Check for network connectivity first
    const netInfo = await NetInfo.fetch();
    
    if (!netInfo.isConnected) {
      setApiResponse({
        status: "error",
        data: null,
        error: "No internet connection. Please check your network settings."
      });
      showNotification("No internet connection", "error");
      return;
    }
    
    setApiResponse({ status: "loading", data: null });
    
    try {
      // Create an AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        // Adding cache control headers for better Android caching behavior
        cache: 'no-cache',
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      setApiResponse({ status: "success", data });
      showNotification("API request successful", "success");
    } catch (error) {
      console.error("API request failed:", error);
      
      // Handle specific Android network errors
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Special handling for timeout
        if (error.name === 'AbortError') {
          errorMessage = "Request timed out. Check your network connection.";
        }
        
        // Special handling for Android network errors
        if (Platform.OS === 'android' && errorMessage.includes('Network request failed')) {
          errorMessage = "Network connection failed. Please check your internet connection.";
        }
      }
      
      setApiResponse({
        status: "error",
        data: null,
        error: errorMessage,
      });
      showNotification("API request failed", "error");
    }
  };

  useEffect(() => {
    fetchApi(endpoint);
  }, []);

  const retryRequest = () => {
    fetchApi(endpoint);
  };

  const tryAnotherEndpoint = (newEndpoint: string) => {
    setEndpoint(newEndpoint);
    fetchApi(newEndpoint);
  };

  const renderApiData = () => {
    switch (apiResponse.status) {
      case "loading":
        return (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#4287f5" />
            <Text style={styles.loadingText}>Fetching data...</Text>
          </View>
        );
      case "error":
        return (
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>Error: {apiResponse.error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={retryRequest}>
              <Text style={styles.buttonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        );
      case "success":
        return (
          <ScrollView style={styles.jsonContainer}>
            <Text style={styles.endpointText}>Endpoint: {endpoint}</Text>
            <Text style={styles.jsonTitle}>Response:</Text>
            <Text style={styles.jsonContent}>
              {JSON.stringify(apiResponse.data, null, 2)}
            </Text>
          </ScrollView>
        );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Test</Text>
      <View style={styles.networkStatusContainer}>
        <Text style={[
          styles.networkStatus, 
          networkState.isConnected ? styles.connected : styles.disconnected
        ]}>
          Network: {networkState.details || "Checking..."}
        </Text>
      </View>
      <View style={styles.content}>
        {renderApiData()}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.endpointButton}
          onPress={() => tryAnotherEndpoint("https://jsonplaceholder.typicode.com/posts/1")}
        >
          <Text style={styles.buttonText}>Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.endpointButton}
          onPress={() => tryAnotherEndpoint("https://jsonplaceholder.typicode.com/users/1")}
        >
          <Text style={styles.buttonText}>Users</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.endpointButton}
          onPress={() => tryAnotherEndpoint("https://jsonplaceholder.typicode.com/todos/1")}
        >
          <Text style={styles.buttonText}>Todos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  networkStatusContainer: {
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  networkStatus: {
    fontSize: 14,
    fontWeight: "500",
  },
  connected: {
    color: "#4caf50",
  },
  disconnected: {
    color: "#f44336",
  },
  content: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#f44336",
    marginBottom: 16,
    textAlign: "center",
  },
  jsonContainer: {
    flex: 1,
  },
  endpointText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  jsonTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  jsonContent: {
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#4287f5",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  endpointButton: {
    backgroundColor: "#4287f5",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
