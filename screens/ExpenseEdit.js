import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  where,
  query
} from 'firebase/firestore';

const ExpenseEdit = ({ route, navigation }) => {
  const { expense } = route.params;
  const [amount, setAmount] = useState(String(expense.amount));
  const [selectedCategory, setSelectedCategory] = useState(expense.category);
  const [categories, setCategories] = useState([]);
  const [date, setDate] = useState(
    expense.date.toDate ? expense.date.toDate() : new Date(expense.date)
  );
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const fetchExpenseCategories = async () => {
      const q = query(collection(db, 'categories'), where('type', '==', 'expense'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(list);
    };
    fetchExpenseCategories();
  }, []);

  const handleUpdate = async () => {
    try {
      const ref = doc(db, 'expenses', expense.id);
      await updateDoc(ref, {
        amount: parseFloat(amount),
        category: selectedCategory,
        date: Timestamp.fromDate(date),
      });
      alert('Gider güncellendi!');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      alert('Güncelleme başarısız.');
    }
  };

  const handleDelete = () => {
    console.log('handleDelete fonksiyonu çağrıldı.');
    
    if (!expense || !expense.id) {
      alert("Gider ID'si bulunamadı.");
      return;
    }

    Alert.alert(
      'Silmek istediğinize emin misiniz?',
      'Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            console.log('Silme işlemi onaylandı.');
            try {
              await deleteDoc(doc(db, 'expenses', expense.id));
              alert('Gider silindi.');
              navigation.goBack();
            } catch (error) {
              console.error('Silme hatası:', error);
              alert('Silme işlemi başarısız.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Tutar"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Kategori:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          {categories.map(cat => (
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
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      )}

      <Button mode="contained" onPress={handleUpdate} style={styles.input} buttonColor="#f44336">
        Güncelle
      </Button>

      <Button
        mode="contained"
        onPress={handleDelete}
        buttonColor="#d32f2f"
        style={styles.input}
      >
        Gideri Sil
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  input: {
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  pickerContainer: {
    marginBottom: 15,
    backgroundColor: 'white',
    borderRadius: 5,
  },
});

export default ExpenseEdit;