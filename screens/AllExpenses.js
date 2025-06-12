import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';

const AllExpenses = ({ navigation }) => {
  const [expenses, setExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Tüm giderleri getir
        const expenseQuery = query(collection(db, 'expenses'), orderBy('date', 'desc'));
        const expenseSnapshot = await getDocs(expenseQuery);
        const expenseList = expenseSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExpenses(expenseList);
        setAllExpenses(expenseList);

        // Gider kategorilerini getir
        const categoryQuery = query(collection(db, 'categories'), where('type', '==', 'expense'));
        const categorySnapshot = await getDocs(categoryQuery);
        const categoryList = categorySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoryList);
      } catch (error) {
        console.error('Veriler alınamadı:', error);
      }
    };

    fetchData();
  }, []);

  // Kategori seçimi değiştiğinde filtreleme yap
  const handleCategoryChange = (categoryValue) => {
    setSelectedCategory(categoryValue);
    
    if (categoryValue === 'all') {
      setExpenses(allExpenses);
    } else {
      const filteredExpenses = allExpenses.filter(expense => expense.category === categoryValue);
      setExpenses(filteredExpenses);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Tüm Giderler</Text>
      
      <Text style={styles.label}>Kategori Filtresi:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={handleCategoryChange}
        >
          <Picker.Item label="Tüm Kategoriler" value="all" />
          {categories.map((cat) => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.name} />
          ))}
        </Picker>
      </View>

      {expenses.length > 0 ? (
        expenses.map(item => (
          <TouchableOpacity
            key={item.id}
            onPress={() => navigation.navigate('ExpenseEdit', { expense: item })}
          >
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.text}>
                  {item.category} - {item.amount} ₺
                </Text>
                <Text style={styles.date}>
                  {new Date(item.date.toDate ? item.date.toDate() : item.date).toLocaleDateString()}
                </Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.message}>
              {selectedCategory === 'all' ? 'Henüz gider verisi yok.' : 'Bu kategoride gider bulunamadı.'}
            </Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 5,
    marginBottom: 15,
    elevation: 2,
  },
  card: {
    marginBottom: 10,
    backgroundColor: '#ffebee',
  },
  text: {
    fontSize: 16,
    color: '#2c3e50',
  },
  date: {
    color: '#7f8c8d',
    fontSize: 12,
    marginTop: 4,
  },
  message: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
});

export default AllExpenses;