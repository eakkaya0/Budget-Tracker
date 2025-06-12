import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { TextInput, Button, Text, Card, SegmentedButtons } from 'react-native-paper';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

const CategoryAdd = ({ navigation }) => {
  const [category, setCategory] = useState('');
  const [categoryType, setCategoryType] = useState('expense'); // 'expense' veya 'income'
  const [categories, setCategories] = useState([]);

  // Kategorileri canlı olarak al
  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(list);
    });

    return () => unsubscribe();
  }, []);

  const handleAddCategory = async () => {
    if (!category.trim()) return;

    await addDoc(collection(db, 'categories'), {
      name: category,
      type: categoryType, // Kategori türü eklendi
      createdAt: new Date().toISOString()
    });

    setCategory('');
  };

  // Kategorileri türe göre ayır
  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const incomeCategories = categories.filter(cat => cat.type === 'income');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gider Kategorileri</Text>
      <FlatList
        data={expenseCategories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={[styles.card, styles.expenseCard]}>
            <Card.Content>
              <Text>{item.name}</Text>
            </Card.Content>
          </Card>
        )}
        style={styles.categoryList}
      />

      <Text style={styles.title}>Gelir Kategorileri</Text>
      <FlatList
        data={incomeCategories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={[styles.card, styles.incomeCard]}>
            <Card.Content>
              <Text>{item.name}</Text>
            </Card.Content>
          </Card>
        )}
        style={styles.categoryList}
      />

      <Text style={styles.title}>Yeni Kategori Ekle</Text>
      
      <SegmentedButtons
        value={categoryType}
        onValueChange={setCategoryType}
        buttons={[
          { value: 'expense', label: 'Gider' },
          { value: 'income', label: 'Gelir' },
        ]}
        style={styles.segmentedButtons}
      />

      <TextInput
        label="Kategori Adı"
        value={category}
        onChangeText={setCategory}
        mode="outlined"
        style={styles.input}
      />
      <Button mode="contained" onPress={handleAddCategory}>
        Kaydet
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#2c3e50'
  },
  input: {
    marginBottom: 16
  },
  card: {
    marginBottom: 8
  },
  expenseCard: {
    backgroundColor: '#ffebee'
  },
  incomeCard: {
    backgroundColor: '#e8f5e8'
  },
  categoryList: {
    maxHeight: 150,
    marginBottom: 15
  },
  segmentedButtons: {
    marginBottom: 16
  }
});

export default CategoryAdd;