import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { db } from '../firebase';
import { collection, getDocs, query, addDoc, Timestamp, where } from 'firebase/firestore';

const AddIncome = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const fetchIncomeCategories = async () => {
      const q = query(collection(db, 'categories'), where('type', '==', 'income'));
      const querySnapshot = await getDocs(q);
      const categoryList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoryList);
    };
    fetchIncomeCategories();
  }, []);

  const handleAddIncome = async () => {
    if (!amount || !selectedCategory || !date) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      await addDoc(collection(db, 'incomes'), {
        amount: parseFloat(amount),
        category: selectedCategory,
        date: Timestamp.fromDate(date),
        createdAt: Timestamp.now(),
      });
      alert('Gelir eklendi!');
      navigation.goBack();
    } catch (error) {
      console.error('Gelir eklenemedi: ', error);
      alert('Bir hata oluştu.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Tutar"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        returnKeyType="done"
        onSubmitEditing={() => Keyboard.dismiss()}
        style={styles.input}
      />

      <Text style={styles.label}>Kategori:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
        >
          <Picker.Item label="Kategori seçiniz" value="" />
          {categories.map((cat) => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.name} />
          ))}
        </Picker>
      </View>

      <Button
        mode="outlined"
        onPress={() => setShowPicker(true)}
        style={styles.input}
      >
        Tarih Seç: {date.toDateString()}
      </Button>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (event.type === 'set' && selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      )}

      <Button mode="contained" onPress={handleAddIncome} buttonColor="#4caf50">
        Geliri Ekle
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  input: {
    marginBottom: 15,
  },
  pickerContainer: {
    marginBottom: 15,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
});

export default AddIncome;