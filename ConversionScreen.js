import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ConversionScreen = () => {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchCurrencies();
    retrieveLastConversionAmount();
  }, []);

  const fetchCurrencies = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
      const rates = response.data.rates;
      const currencyList = Object.keys(rates);
      setCurrencies(currencyList);
      setFromCurrency('USD');
      setToCurrency(currencyList.find(currency => currency !== 'USD')); 
    } catch (error) {
      console.error('Error fetching currencies: ', error);
      Alert.alert('Error', 'Failed to fetch currencies. Please try again later.');
    }
    setLoading(false);
  };

  const convertCurrency = async () => {
    setLoading(true);
    try {
      if (!amount || isNaN(amount)) {
        Alert.alert('Invalid Amount', 'Please enter a valid numeric amount.');
        return;
      }
      const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
      const rates = response.data.rates;
      const result = (parseFloat(amount) * rates[toCurrency]).toFixed(2);
      setConvertedAmount(result);
      saveLastConversionAmount(result)
    } catch (error) {
      console.error('Error converting currency: ', error);
      Alert.alert('Error', 'Failed to convert currency. Please try again later.');
    }
    setLoading(false);
  };

  const retrieveLastConversionAmount = async () => {
    try{
      const lastConversion = await AsyncStorage.getItem('lastConversionAmount');
      if(lastConversion){
        setConvertedAmount(lastConversion);
      }
    } catch (error) {
      console.error('Error retrieving last conversion amount: ', error);
    }
  };

  const saveLastConversionAmount = async (result) => {
    try{
      await AsyncStorage.setItem('lastConversionAmount', result);
    }
    catch (error) {
      console.error('Error saving last conversion amount: ', error);
    }
  }

  const clearFields = () => {
    setAmount('');
    setConvertedAmount('');
  }

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Currency Converter</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={(text) => setAmount(text)}
        keyboardType="numeric"
        placeholder="Enter Amount"
      />
      <Picker
        selectedValue={fromCurrency}
        onValueChange={(itemValue) => setFromCurrency(itemValue)}
        style={styles.picker}
      >
        {currencies.map((currency) => (
          <Picker.Item key={currency} label={currency} value={currency} />
        ))}
      </Picker>
      <Text style={styles.toText}>to</Text>
      <Picker
        selectedValue={toCurrency}
        onValueChange={(itemValue) => setToCurrency(itemValue)}
        style={styles.picker}
      >
        {currencies.map((currency) => (
          <Picker.Item key={currency} label={currency} value={currency} />
        ))}
      </Picker>
      <Button title="Convert" onPress={convertCurrency} disabled={loading} />
      <Button title="Swap Currencies" onPress={swapCurrencies} />
      <Button title="Clear" onPress={clearFields} disabled={loading} />
      <Text style={styles.result}>{convertedAmount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    width: 200,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: 200,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  toText: {
    marginVertical: 10,
    fontSize: 16,
    color: '#555',
  },
  result: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#007bff',
  },
});

export default ConversionScreen;
